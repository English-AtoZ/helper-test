import React, { useState, useEffect, useRef } from 'react';

const LearnWithAudio = () => {
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('hi-IN');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      translateToEnglish(text);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, [lang]);

  const translateToEnglish = async (text) => {
    if (!text) return;
    setIsLoading(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=en&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      const translated = data[0][0][0];
      setEnglishTranslation(translated);
      speakEnglish(translated);
    } catch {
      setError('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const speakEnglish = (text) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-US';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  const startListening = () => {
    setTranscript('');
    setEnglishTranslation('');
    setError('');
    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current.stop();
    setListening(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerWrap}>
        <div style={styles.displayArea}>
          <div style={styles.resultBox}>
            <small>Hindi Input hai bro:</small>
            <p style={styles.hindiText}>{transcript || '...'}</p>
          </div>

          <div style={{ ...styles.resultBox, borderLeft: '5px solid green' }}>
            <small>English Translation:</small>
            <p style={styles.engText}>
              {isLoading ? 'Translating...' : englishTranslation || '...'}
            </p>
          </div>
        </div>

        <div style={styles.inputWrapper}>
          <button onClick={startListening} disabled={listening} style={styles.micBtn}>
            Start Listening
          </button>

          <button onClick={stopListening} disabled={!listening} style={{ ...styles.micBtn, color: 'red' }}>
            Stop
          </button>

          <p style={styles.status}>
            {listening ? 'Listening...' : 'Tap Start'}
          </p>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div>
            <button onClick={() => setLang('hi-IN')}>Hindi</button>
            <button onClick={() => setLang('en-US')}>English</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center' },
  innerWrap: { width: '100%', padding: '20px' },
  displayArea: { display: 'flex', flexDirection: 'column', gap: '20px' },
  resultBox: { padding: '15px', background: '#eee', borderRadius: '10px' },
  hindiText: { fontSize: '28px', color: 'blue' },
  engText: { fontSize: '28px', color: 'red' },
  inputWrapper: { textAlign: 'center' },
  micBtn: { fontSize: '16px', margin: '5px', cursor: 'pointer' },
  status: { fontWeight: 'bold', marginTop: '10px' }
};

export default LearnWithAudio;
