function runScript() {
    fetch('/run-script')
        .then(response => response.json())
        .then(data => {
            document.getElementById('results').innerHTML = `
                <p>These are the most happening topics as on ${data.date}:</p>
                <ul>
                    ${data.trends.map(trend => `<li>${trend}</li>`).join('')}
                </ul>
                <p>The IP address used for this query was ${data.ip}.</p>
            `;
        })
        .catch(error => console.error('Failed to fetch the data:', error));
}
