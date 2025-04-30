'use client';
import React, { useState, FormEvent, ChangeEvent } from 'react';

interface ConfigurationData {
  endpointUrl: string;
  method: string;
  params: Record<string, string>;
  body: any;
  bodyType: 'json' | 'raw';
  mapping: Record<string, string>;
}

interface ConfigurationFormProps {
  onSave: (data: ConfigurationData) => void;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSave }) => {
  const [endpointUrl, setEndpointUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [params, setParams] = useState('');
  const [body, setBody] = useState('');
  const [bodyType, setBodyType] = useState<'json' | 'raw'>('json');
  const [mapping, setMapping] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const parsedParams = params
        ? Object.fromEntries(new URLSearchParams(params))
        : {};
      const parsedMapping = mapping ? JSON.parse(mapping) : {};
      const parsedBody = bodyType === 'json' && body ? JSON.parse(body) : body;

      onSave({
        endpointUrl,
        method,
        params: parsedParams,
        body: parsedBody,
        bodyType,
        mapping: parsedMapping,
      });
    } catch (error: any) {
      alert(`Gagal memproses input: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="configuration-form">
      <div>
        <label htmlFor="endpointUrl">Endpoint URL:</label>
        <input
          type="url"
          id="endpointUrl"
          value={endpointUrl}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEndpointUrl(e.target.value)
          }
          required
        />
      </div>
      <div>
        <label htmlFor="method">Method:</label>
        <select
          id="method"
          value={method}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setMethod(e.target.value)
          }
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div>
        <label htmlFor="params">URL Parameters (query string):</label>
        <input
          type="text"
          id="params"
          placeholder="key1=value1&key2=value2"
          value={params}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setParams(e.target.value)
          }
        />
      </div>
      <div>
        <label htmlFor="bodyType">Body Type:</label>
        <select
          id="bodyType"
          value={bodyType}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setBodyType(e.target.value as 'json' | 'raw')
          }
        >
          <option value="json">JSON</option>
          <option value="raw">Raw</option>
        </select>
      </div>
      <div>
        <label htmlFor="body">
          Request Body ({bodyType === 'json' ? 'JSON' : 'Raw'}):
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setBody(e.target.value)
          }
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="mapping">
          Mapping (JSON - mondayColumnId: 'api.response.path'):
        </label>
        <textarea
          id="mapping"
          value={mapping}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setMapping(e.target.value)
          }
          rows={6}
          placeholder='{"your_monday_column_id": "api.data.field"}'
          required
        />
      </div>
      <button type="submit">Simpan Konfigurasi</button>
    </form>
  );
};

export default ConfigurationForm;
