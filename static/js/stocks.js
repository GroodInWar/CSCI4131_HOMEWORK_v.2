const API_KEY = "X9T8SI5I4AJB2X87";

async function getData(ticker_symbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker_symbol}&interval=5min&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return { error: error.message };
    }
}

$(function () {
    // Handle form submission
    $('form').on('submit', function (e) {
        e.preventDefault();
        const symbol = $('#stock').val().trim().toUpperCase();
        if (symbol) {
            getData(symbol).then(data => {
                if (data['Error Message']) {
                    $('#stock_result').val(`Error: ${data['Error Message']}`);
                } else if (data['Note']) {
                    $('#stock_result').val(`API Limit Reached: ${data['Note']}`);
                } else if (data['Meta Data']) {
                    $('#stock_result').val(JSON.stringify(data, null, 2));
                } else {
                    $('#stock_result').val('Unexpected response format.');
                }
            }).catch(error => {
                $('#stock_result').val(`Failed to fetch data: ${error}`);
            });
        }
    });
});