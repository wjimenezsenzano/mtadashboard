# mtadashboard

This interactive dashboard explores accessibility and structural characteristics of NYC subway stations using three coordinated views: a geographic map, an ADA accessibility bar chart, and a structure-type bar chart.

Features:
Map view displays all subway stations by location, color-coded by borough. Hovering shows station names; clicking selects a station and reveals detailed information.
ADA chart shows counts of ADA vs. non-ADA accessible stations by borough.
Structure chart displays counts of stations by structure type (e.g., underground, elevated).

Interactivity:
Clicking a station on the map highlights the corresponding bars in both charts.
Bar charts update visually to reflect the selected station’s attributes.
Hover tooltips provide additional details for both map points and bars.
Clicking the background resets all selections and returns the dashboard to its default state.

Design Choices:
Coordinated highlighting is used instead of filtering to maintain context across all views.
Color distinguishes boroughs, while stroke and opacity emphasize selection.
Axis labels and tooltips were refined for readability.

Data:
Source: MTA Subway Stations dataset
Fields used include station name, borough, structure type, and ADA accessibility.
