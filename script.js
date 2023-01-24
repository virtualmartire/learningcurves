function gotFiles(input) {

    const file_list = Array.from(input.files);

    file_list.forEach((file) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {     // because asynchrony
            const json_string = reader.result;
            const json_curves = JSON.parse(json_string);
            const run_name = Object.keys(json_curves)[0];
            saveRun(run_name, json_string);
            visualizeData(json_curves);
        });
        reader.readAsText(file);
    });

}

function saveRun(run_name, json_string) {
    localStorage.setItem(run_name, json_string);
}

function visualizeData(json_curves) {

    const run_name = Object.keys(json_curves)[0];
    const metric_name = Object.keys(json_curves[run_name])[0];
    const metric_data = json_curves[run_name][metric_name];
    var chart = getChartById(metric_name) || addChart(metric_name);

    drawCurve(run_name, metric_data, chart);
    chart.update()

}

function getChartById(chart_id) {
    return Object.values(Chart.instances).filter((c) => c.canvas.id == chart_id).pop()
}

function addChart(metric_name) {

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

function drawCurve(run_name, metric_data, chart) {

    const epochs = metric_data.map(pair => pair[0]);
    const values = metric_data.map(pair => pair[1]);
    var chart_datasets = chart.data.datasets;
    
    // Update the x-axis
    if (chart.data.labels.slice(-1)[0] < epochs.slice(-1)[0]) {
        console.log("oh");
        chart.data.labels = epochs;
    }

    // Remove the old dataset
    removeOldDataset(chart_datasets, run_name);

    // Add the new one
    chart_datasets.push({label: run_name,
                        data: values,
                        fill: false,
                        tension: 0.1});

}

function removeOldDataset(chart_datasets, run_name) {

    const old_dataset = chart_datasets.filter((dataset) => dataset.label == run_name).pop();
    const index = chart_datasets.indexOf(old_dataset);

    if (index > -1) { // only splice array when item is found
        chart_datasets.splice(index, 1); // 2nd parameter means remove one item only
    }

}