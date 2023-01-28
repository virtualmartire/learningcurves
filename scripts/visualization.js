function updateExperimentsListHTML(run_name) {

    const experiments_list = document.getElementById("experiments_list");
    const existing_runs = Array.from(experiments_list.childNodes).map(x => x.id);
    const new_run = document.createElement('div');
    const checkbox = document.createElement('input');
    
    if (!existing_runs.includes(run_name)) {
                
        new_run.id = run_name;
        checkbox.type = 'checkbox';
        experiments_list.appendChild(new_run);
        new_run.appendChild(checkbox);
        new_run.innerHTML += " " + run_name;
    
    }

}

function drawCurve(metric_name, run_name, metric_data) {

    var chart = getChartById(metric_name) || addChartHTML(metric_name);
    const epochs = metric_data.map(pair => pair[0]);
    const values = metric_data.map(pair => pair[1]);
    var chart_datasets = chart.data.datasets;
    
    // Update the x-axis
    if (chart.data.labels.slice(-1)[0] < epochs.slice(-1)[0]) {
        chart.data.labels = epochs;
    }

    // Remove the old dataset
    removeOldDataset(chart_datasets, run_name);

    // Add the new one
    chart_datasets.push({label: run_name,
                        data: values,
                        fill: false});
    
    // Re-render the chart
    chart.update();

}

function getChartById(chart_id) {
    return Object.values(Chart.instances).filter((c) => c.canvas.id == chart_id).pop()
}

function addChartHTML(metric_name) {

    const new_graph = document.createElement('canvas');
    const graphs_area = document.getElementById('graphs_area');
    
    // Add the canvas tag
    new_graph.id = metric_name;
    new_graph.classList.add("graph");
    graphs_area.appendChild(new_graph);
    
    // Create the chart object
    var chart = new Chart(metric_name, {type: "line",
                                            data: {
                                                    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                                                    datasets: []
                                                },
                                            options: {
                                                scales: {
                                                // yAxes: [{ticks: {min: 6, max:16}}],
                                                },
                                                maintainAspectRatio: false
                                            }
                                        });
    
    return chart;

}

function removeOldDataset(chart_datasets, run_name) {

    const old_dataset = chart_datasets.filter((dataset) => dataset.label == run_name).pop();
    const index = chart_datasets.indexOf(old_dataset);

    if (index > -1) { // only splice array when item is found
        chart_datasets.splice(index, 1); // 2nd parameter means remove one item only
    }

}