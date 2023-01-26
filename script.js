function loadExistingData() {
    /* The function that fires when the application starts. */

    const metrics_names_array = Object.keys(localStorage);

    metrics_names_array.forEach((metric_name) => {

        const metric_dict = JSON.parse(localStorage.getItem(metric_name));
        const runs_names_array = Object.keys(metric_dict);

        runs_names_array.forEach((run_name) => {

            const metric_data = metric_dict[run_name];

            updateExperimentsListHTML(run_name);
            drawCurve(metric_name, run_name, metric_data);

        });

    });

}

function updateExperimentsListHTML(run_name) {

    const experiments_list = document.getElementById("experiments_list");
    const existing_runs = Array.from(experiments_list.childNodes).map(x => x.id);
    const new_run = document.createElement('li');
    const checkbox = document.createElement('input');
    
    if (!existing_runs.includes(run_name)) {
                
        new_run.id = run_name;
        checkbox.type = 'checkbox';
        experiments_list.appendChild(new_run);
        new_run.appendChild(checkbox);
        new_run.innerHTML += " " + run_name;
    
    }

}

function gotFiles(input) {
    /* The function that fires when some files are loaded. */

    const file_list = Array.from(input.files);

    file_list.forEach((file) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => {     // because asynchrony

            const json_dict = JSON.parse(reader.result);
            const run_name = Object.keys(json_dict)[0];     // every file has only one run
            const metrics_names_array = Object.keys(json_dict[run_name]);

            metrics_names_array.forEach((metric_name) => {

                const metric_data = json_dict[run_name][metric_name];

                saveMetricData(metric_name, run_name, metric_data);    // data are stored per-metric and not per-run
                drawCurve(metric_name, run_name, metric_data);

            })

        });
        reader.readAsText(file);
    });

}

function saveMetricData(metric_name, run_name, metric_data) {
    // Of course, runs are always updated and never taken back to past results

    var metric_dict = JSON.parse(localStorage.getItem(metric_name)) || {};

    metric_dict[run_name] = metric_data;
    localStorage.setItem(metric_name, JSON.stringify(metric_dict));

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