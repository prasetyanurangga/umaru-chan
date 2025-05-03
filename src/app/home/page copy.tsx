'use client';

import React, { useState, useEffect } from 'react';
import ConfigurationForm from '../components/configurationForm';
import mondaySdk from 'monday-sdk-js';

import Cookies from 'js-cookie';
import TreeView, { TreeNodeData } from '../components/treeView';

const monday = mondaySdk();

interface Column {
  id: string;
  title: string;
}

interface Board {
  id?: string;
  name?: string;
  columns?: Column[];
}

function Home() {
  const [selectedBoard, setSelectedBoard] = useState<Board>(null);
  const [config, setConfig] = useState<any>(null);
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);

  const [boardList, setBoardList] = useState<Board[]>([]);
  const [columnsList, setColumnsList] = useState<any[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const apiUrl = "api"


  useEffect(() => {
    if(!sessionToken) return;

    handleLoadBoard(sessionToken);
  }, [sessionToken])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const baseUrl = window.location.origin;

    Cookies.set('base_url', baseUrl, { path: '/', sameSite: 'Lax' });
    const code = urlParams.get("code");

    if (code && !localStorage.getItem("monday_token")) {
      fetch(`${apiUrl}/auth/callback?code=${code}`, {
        method: "GET"
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem("monday_token", data.access_token);
            window.history.replaceState({}, document.title, "/");
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


  }, []);

  const handleSaveConfig = async (configuration: any) => {
    if (!selectedBoard.id) {
      alert('Board ID tidak terdeteksi.');
      return;
    }
    configuration.selectedBoard.id = selectedBoard.id;
    try {
      const par = {
        endpointUrl : configuration.endpointUrl,
        method: configuration.method.toUpperCase(),
        params: configuration.params,
        body: configuration.requestBody,
        bodyType: configuration.bodyType.toLowerCase(),
        mapping: configuration.mapping
      };

      const res = await monday.storage.instance.setItem(`config_${selectedBoard.id}`, JSON.stringify(par));

      if (res.data) {
        setConfig(res.data);
        alert('Konfigurasi berhasil disimpan!');
      } else {
        alert(`Gagal menyimpan konfigurasi: ${res.errorMessage || 'Terjadi kesalahan'}`);
      }
    } catch (error: any) {
      alert(`Gagal menghubungi backend: ${error.message}`);
    }
  };

  const handleTriggerSync = async () => {
    if (!selectedBoard.id) {
      alert('Board ID tidak terdeteksi.');
      return;
    }
    setTriggerStatus('Loading...');
    try {
      const res = await monday.storage.instance.getItem(`config_${selectedBoard.id}`);
      console.log(res.data.value)
      const response = await fetch(`${apiUrl}/trigger/${selectedBoard.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: res.data.value
      });
      const data = await response.json();
      if (response.ok) {
        setTriggerStatus(`Sinkronisasi berhasil: ${data.message}`);
      } else {
        setTriggerStatus(`Gagal sinkronisasi: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (error: any) {
      setTriggerStatus(`Gagal menghubungi backend: ${error.message}`);
    } finally {
      setTimeout(() => setTriggerStatus(null), 5000);
    }
  };

  const handleLoadBoard = async (sessionToken) => {
    // setTriggerStatus('Loading...');
    try {
      const response = await fetch(`${apiUrl}/boards`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBoardList(data.data.boards);
        // setTriggerStatus(`Sinkronisasi berhasil: ${data.message}`);
      } else {
        console.log("error", data);
        // setTriggerStatus(`Gagal sinkronisasi: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (error: any) {
      // setTriggerStatus(`Gagal menghubungi backend: ${error.message}`);
    } finally {
      setTimeout(() => setTriggerStatus(null), 5000);
    }
  };

  const handleChangeBoard = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const selected = boardList.find(board => board.id === selectedId);
    console.log("selected", selected);  
    setSelectedBoard(selected || {});
    setConfig(null);
  };


  const treeData: TreeNodeData[] = [
    {
      id: "ho6ef1ijj2p",
      name: "root",
      children: [
        {
          id: "u0nmjk8drz",
          name: "Data 1",
          children: [
            {
              id: "k54pz4u1np",
              name: "order_id: ORD12345",
            },
            {
              id: "atfvh32uko",
              name: "tracking_number: TRK987654321",
            },
            {
              id: "jx6dza137lo",
              name: "courier: JNE",
            },
            {
              id: "usp61cl8sug",
              name: "shipment_status: IN_TRANSIT",
            },
            {
              id: "6iuos96wvy",
              name: "shipment_date: 2025-04-28",
            },
          ],
        },
        {
          id: "cvypixttma",
          name: "Data 2",
          children: [
            {
              id: "z0m3zh8rhic",
              name: "order_id: ORD12346",
            },
            {
              id: "ewe37toimy",
              name: "tracking_number: TRK987654322",
            },
            {
              id: "n6tg48pu4u",
              name: "courier: TIKI",
            },
            {
              id: "9om9oyl4adk",
              name: "shipment_status: DELIVERED",
            },
            {
              id: "cfgaljar3ya",
              name: "shipment_date: 2025-04-27",
            },
          ],
        },
      ],
    },
  ];
  

  return (
    <div className="app-container">
      <h1>API Gateway Integration</h1>
      <span>{apiUrl}</span>
      <span>Board ID: {selectedBoard?.id ?? "Board ID Kosong"}</span>
      {
        boardList.length > 0 ? (
          <select onChange={(e) => handleChangeBoard(e)} value={selectedBoard?.id ?? ""}>
            {boardList.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        ) : (
          <p>Memuat daftar board...</p>
        )
      }

      {selectedBoard?.id ? (
        <>
          {
            selectedBoard.columns.length > 0 ? (
              <div>
                {selectedBoard.columns.map((column: Column) => (
                  <div key={column.id} className="column-item">
                    <strong>{column.title}</strong> (ID: {column.id})
                  </div>
                ))}
              </div>
            ) : (
              <p>Memuat daftar kolom...</p>
            )
          }
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

export default Home;
