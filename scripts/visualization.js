function updateExperimentsListHTML(run_name) {

    const experiments_list = document.getElementById("experiments_list");
    const existing_runs = Array.from(experiments_list.childNodes).map(x => x.id);
    const new_run = document.createElement('div');
    const del_button = document.createElement('button');
    const hide_button = document.createElement('button');
    
    if (!existing_runs.includes(run_name)) {
                
        new_run.id = run_name;

        del_button.type = 'button';
        // del_button.onclick = "deleteRun(run_name)";
        del_button.setAttribute('onclick', `deleteRun('${run_name}')`);
        del_button.innerHTML = "del";
        hide_button.type = 'button';
        // hide_button.onclick = "hideRun()";
        hide_button.innerHTML = "hide";

        experiments_list.appendChild(new_run);
        new_run.appendChild(del_button);
        new_run.appendChild(hide_button);
        new_run.innerHTML += " " + run_name;
    
    }

}

function hideRun() {

}

function drawCurve(metric_name, run_name, metric_data) {

    var chart = getChartObjectById(metric_name) || addChartObjectAndHTML(metric_name);
    const epochs = metric_data.map(pair => pair[0]);
    const values = metric_data.map(pair => pair[1]);
    var chart_datasets = chart.data.datasets;
    
    // Update the x-axis
    if (chart.data.labels.slice(-1)[0] < epochs.slice(-1)[0]) {
        chart.data.labels = epochs;
    }

    // Remove the old dataset
    removeRunFromChart(chart_datasets, run_name);

    // Add the new one
    chart_datasets.push({label: run_name,
                        data: values,
                        fill: false});
    
    // Re-render the chart
    chart.update();

}

function getChartObjectById(chart_id) {
    return Object.values(Chart.instances).filter((c) => c.canvas.id == chart_id).pop()
}

function addChartObjectAndHTML(metric_name) {

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

function removeRunFromChart(chart_datasets, run_name) {

    const old_dataset = chart_datasets.filter((dataset) => dataset.label == run_name).pop();
    const index = chart_datasets.indexOf(old_dataset);

    if (index > -1) { // only splice array when item is found
        chart_datasets.splice(index, 1); // 2nd parameter means remove one item only
    }

}