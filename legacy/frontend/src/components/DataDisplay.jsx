import React from 'react';

function DataDisplay({ data }) {
    if (!data) {
        return <p>Tidak ada data ditampilkan.</p>;
    }
    return (
        <div className="data-display">
            <h2>Data dari API:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

export default DataDisplay;