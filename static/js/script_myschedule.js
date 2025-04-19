// script_myschedule.js
$(document).ready(async () => {
    try {
        const response = await fetch('/event', { method: 'GET' });
        if (!response.ok) {
            console.log(`HTTP error! status: ${response.status}`);
        }
        const events = await response.json();
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        // Group events by day with proper ordering
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
            'Friday', 'Saturday', 'Sunday'];
        const groupedEvents = events.reduce((acc, event) => {
            const day = event.day;
            if (!acc[day]) acc[day] = [];
            acc[day].push(event);
            return acc;
        }, {});

        // Create table rows with proper rowspans
        dayOrder.forEach(day => {
            const dayEvents = groupedEvents[day] || [];
            if (dayEvents.length === 0) return;

            dayEvents.forEach((event, index) => {
                const row = document.createElement('tr');

                if (index === 0) {
                    // First row with day and rowspan
                    row.innerHTML = `
                        <td rowspan="${dayEvents.length}">${escapeHtml(day)}</td>
                        ${createRow(event)}
                    `;
                } else {
                    // Subsequent rows without day
                    row.innerHTML = createRow(event);
                }

                tbody.appendChild(row);
            });
        });

    } catch (error) {
        console.error('Error loading schedule:', error);
        const errorRow = document.createElement('tr');
        errorRow.innerHTML = `
            <td colspan="7" class="error-message">
                Failed to load schedule: ${escapeHtml(error.message)}
            </td>
        `;
        document.querySelector('tbody').prepend(errorRow);
    }
});

// Delete button handling with event delegation
$(document).on('click', '.delete-button', async function() {
    try {
        const id = $(this).attr('id');
        const response = await fetch('/event', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        if (!response.ok) {
            console.log(`HTTP error! status: ${response.status}`);
        }

        // Remove the row from DOM
        const row = $(this).closest('tr');
        const dayRow = row.prev('tr').find('td[rowspan]');

        if (dayRow.length) {
            const rowspan = parseInt(dayRow.attr('rowspan'));
            if (rowspan > 1) {
                dayRow.attr('rowspan', rowspan - 1);
            } else {
                dayRow.parent().remove();
            }
        }
        row.remove();

        alert('Event deleted successfully');
    } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete event: ' + error.message);
    }
});

// XSS prevention
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Table row creation
function createRow(row) {
    return `
        <td>${escapeHtml(row.event)}</td>
        <td>${escapeHtml(row.start)} - ${escapeHtml(row.end)}</td>
        <td>${escapeHtml(row.location)}</td>
        <td>${escapeHtml(row.phone)}</td>
        <td><a href="${escapeHtml(row.url)}" target="_blank">Link</a></td>
        <td><button class="delete-button" id="${row.id}">Delete</button></td>
    `;
}