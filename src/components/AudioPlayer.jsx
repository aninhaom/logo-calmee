import { useState } from "react";

const sounds = {
  aguacorrente: "/assets/sounds/ambientes/aguacorrente.mp3",
  chuvasuave: "/assets/sounds/ambientes/chuvasuave.mp3",
  lareira: "/assets/sounds/ambientes/lareira.mp3",
  notasdepiano: "/assets/sounds/ambientes/notasdepiano.mp3",
  passaros: "/assets/sounds/ambientes/passaros.mp3",
  somsubaquatico: "/assets/sounds/ambientes/somsubaquatico.mp3",
  tacatibetana: "/assets/sounds/ambientes/tacatibetana.mp3",
  ventosuave: "/assets/sounds/ambientes/ventosuave.mp3",
  whitenoise: "/assets/sounds/ambientes/whitenoise.mp3"
};


  const [audio, setAudio] = useState(null);

  function play(soundKey) {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const newAudio = new Audio(sounds[soundKey]);
    newAudio.volume = 0.8;
    
    // Tratamento de erro para arquivos não encontrados
    newAudio.addEventListener('error', (e) => {
      console.error(`Erro ao carregar áudio ${soundKey}:`, e);
      alert(`Não foi possível carregar o áudio. Verifique se o arquivo existe em: ${sounds[soundKey]}`);
    });

    newAudio.play().catch(err => {
      console.error(`Erro ao reproduzir áudio ${soundKey}:`, err);
      alert(`Erro ao reproduzir áudio. Certifique-se de que o arquivo existe e está no formato correto.`);
    });

    setAudio(newAudio);
  }

  function stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudio(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <button onClick={() => play("chuva")}>Som de Chuva</button>
      <button onClick={() => play("vento")}>Som de Vento</button>
      <button onClick={() => play("meditacao1")}>Meditação 1</button>

      <button onClick={stop} style={{ background: "#e66" }}>
        Parar Todos
      </button>
    </div>
  );
}
