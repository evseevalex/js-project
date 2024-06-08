export class Dashboard {
	constructor() {
		const ctx1 = document.getElementById('left-chart')
		const ctx2 = document.getElementById('right-chart')

		new Chart(ctx1, {
			type: 'pie',
			data: {
				labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
				datasets: [
					{
						label: 'Доходы',
						data: [300, 50, 100, 500, 150],
						backgroundColor: [
							'rgba(220, 53, 69)',
							'rgba(253, 126, 20)',
							'rgba(255, 193, 7)',
							'rgba(32, 201, 151)',
							'rgba(13, 110, 253)',
						],
						hoverOffset: 4,
						// radius: 180,
					},
				],
			},
		})

		new Chart(ctx2, {
			type: 'pie',
			data: {
				labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
				datasets: [
					{
						label: 'Доходы',
						data: [300, 50, 100, 500, 150],
						backgroundColor: [
							'rgba(220, 53, 69)',
							'rgba(253, 126, 20)',
							'rgba(255, 193, 7)',
							'rgba(32, 201, 151)',
							'rgba(13, 110, 253)',
						],
						hoverOffset: 4,
						// radius: 180,
					},
				],
			},
		})
	}
}
