import React, { useState, useEffect } from 'react';
import ConfigurationForm from './components/ConfigurationForm';
import DataDisplay from './components/DataDisplay';
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

const apiUrl = import.meta.env.VITE_API_URL; // Ganti dengan URL backend Anda

function App() {
    const [boardId, setBoardId] = useState(null);
    const [config, setConfig] = useState(null);
    const [triggerStatus, setTriggerStatus] = useState(null);

    const [boardList, setBoardList] = useState([]);
    const [columnsList, setColumnsList] = useState([]);
    const [sessionToken, setSessionToken] = useState(null);

    const handleLogin = () => {
      const authUrl = `${apiUrl}/auth/monday`;
      
      window.location.href = authUrl;
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
      
        if (code && !localStorage.getItem("monday_token")) {
          // Langsung tukar code dengan access token (tanpa backend)
          fetch(`${apiUrl}/auth/callback?code=${code}`, {
            method: "GET"
          })
            .then(res => res.json())
            .then(data => {
              if (data.access_token) {
                localStorage.setItem("monday_token", data.access_token);
                window.history.replaceState({}, document.title, "/"); // Bersihkan URL dari ?code=
                setSessionToken(data.access_token);
              } else {
                alert("Gagal login: " + (data.error || "Unknown error"));
              }
            });
        } else {
          const token = localStorage.getItem("monday_token");
          if (token) {
            setSessionToken(token);
          }
        }
        monday.listen('context', async (res) => {
            if (res.data) {
              console.log(res.data)
                setBoardId(res.data.boardId);
                if (boardId) {
                  // Mendapatkan list columns untuk board yang sedang dipilih
                  const columnsResponse = await monday.api(`query { boards(ids: [${boardId}]) { columns { id name } } }`);
                  const columns = columnsResponse.data.boards[0].columns;
                  setColumnsList(columns);
              }
  
              // Mendapatkan list boards di akun
              const boardsResponse = await monday.api(`query { boards { id name } }`);
              setBoardList(boardsResponse.data.boards);
  
              // Mendapatkan session token
              monday.auth()
                  .then((token) => {
                      setSessionToken(token); // Menyimpan session token
                  })
                  .catch((error) => {
                      console.error('Gagal mendapatkan session token:', error);
                  });
            }

            
        });
    }, []);

    const handleSaveConfig = async (configuration) => {
        if (!boardId) {
            alert('Board ID tidak terdeteksi.');
            return;
        }
        configuration.boardId = boardId;
        try {
            const response = await fetch(`${apiUrl}/configure`, { // Path backend di monday code
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configuration),
            });
            const data = await response.json();
            if (response.ok) {
                setConfig(configuration);
                alert('Konfigurasi berhasil disimpan!');
            } else {
                alert(`Gagal menyimpan konfigurasi: ${data.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            alert(`Gagal menghubungi backend: ${error.message}`);
        }
    };

    const handleTriggerSync = async () => {
        if (!boardId) {
            alert('Board ID tidak terdeteksi.');
            return;
        }
        setTriggerStatus('Loading...');
        try {
            const response = await fetch(`${apiUrl}/trigger/${boardId}`, { // Path backend di monday code
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${sessionToken}`,
                  "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (response.ok) {
                setTriggerStatus(`Sinkronisasi berhasil: ${data.message}`);
            } else {
                setTriggerStatus(`Gagal sinkronisasi: ${data.error || 'Terjadi kesalahan'}`);
            }
        } catch (error) {
            setTriggerStatus(`Gagal menghubungi backend: ${error.message}`);
        } finally {
            setTimeout(() => setTriggerStatus(null), 5000);
        }
    };

    return (
        <div className="app-container">
            <h1>API Gateway Integration</h1>
            <span>Board ID  : {boardId ?? "Board ID Kosong"}</span>
            {
              sessionToken ? <span>{sessionToken}</span> : <button onClick={handleLogin} className="login-button"> Login </button>
            }
            {boardId ? (
                <>
                    <ConfigurationForm onSave={handleSaveConfig} />
                    {config && (
                        <div className="config-display">
                            <h2>Konfigurasi Saat Ini:</h2>
                            <pre>{JSON.stringify(config, null, 2)}</pre>
                            <button onClick={handleTriggerSync} disabled={triggerStatus === 'Loading...'}>
                                {triggerStatus || 'Tarik dan Sinkronkan Data'}
                            </button>
                            {triggerStatus && <p>{triggerStatus}</p>}
                        </div>
                    )}
                    {!config && <p>Silakan konfigurasi integrasi API.</p>}
                </>
            ) : (
                <p>Memuat informasi board...</p>
            )}
        </div>
    );
}

export default App;