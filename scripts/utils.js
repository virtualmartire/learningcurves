function saveAndShowFile(input_dict) {

    const runs_names_array = Object.keys(input_dict);

    runs_names_array.forEach(run_name => {

        const run_dict = input_dict[run_name];
        const metrics_names_array = Object.keys(run_dict);

        saveRun(run_name, run_dict);      // data are stored per-run
        assignColor(run_name);
        metrics_names_array.forEach((metric_name) => {
            const metric_data = run_dict[metric_name];
            updateExperimentsListHTML(run_name);
            drawCurve(metric_name, run_name, metric_data);
        })

    });

    resetDataDivHeight();

}

function saveRun(run_name, run_dict) {
    // Runs are assumed to be always updated and never taken back to past results
    localStorage.setItem(run_name, JSON.stringify(run_dict));
}

function makeTextFile(text) {
    const data = new Blob([text], {type: 'text/plain'});
    textFile = window.URL.createObjectURL(data);
    return textFile;        // returns a URL you can use as a href
}

function updateExperimentsListHTML(run_name) {

    const experiments_list = document.getElementById("experiments_list");
    const existing_runs = Array.from(experiments_list.childNodes).map(x => x.id);
    const new_run = document.createElement('div');
    const del_button = document.createElement('button');
    const hide_button = document.createElement('button');
    
    if (!existing_runs.includes(run_name)) {
                
        new_run.id = run_name;

        del_button.type = 'button';
        del_button.setAttribute('onclick', `deleteRun('${run_name}')`);
        del_button.innerHTML = "del";

        hide_button.type = 'button';
        hide_button.setAttribute('onclick', `hideRun('${run_name}')`);
        hide_button.innerHTML = "hide";
        hide_button.id = `${run_name}_hide_button`;

        experiments_list.appendChild(new_run);
        new_run.appendChild(del_button);
        new_run.appendChild(hide_button);
        new_run.innerHTML += " " + run_name;
    
    }

}

function drawCurve(metric_name, run_name, metric_data) {

    var chart = getChartObjectById(metric_name) || addChartObjectAndHTML(metric_name);
    const epochs = metric_data.map(pair => pair[0]);
    const values = metric_data.map(pair => pair[1]);
    var chart_datasets = chart.data.datasets;
    const color = hexadecimal_dict[run_name];
    
    // Update the x-axis
    if (chart.data.labels.slice(-1)[0] < epochs.slice(-1)[0]) {
        chart.data.labels = epochs;
    }

    // Remove the old dataset
    removeRunFromChart(chart, run_name);

    // Add the new one
    chart_datasets.push({
                            label: run_name,
                            data: values,
                            fill: false,
                            borderColor: color,
                            backgroundColor: color
                        });

    // Compute and add the statistics
    Object.keys(statistics_dict).forEach(statistic_name => {

        const statistic_column = document.getElementById(`${metric_name}_${statistic_name}_column`);
        const statistic_value = document.createElement('div');

        statistic_value.innerHTML = statistics_dict[statistic_name](values);
        statistic_value.style.color = color;
        statistic_value.classList.add(`${run_name}_statistics`);
        statistic_column.appendChild(statistic_value);

    });
    
    // Re-render the chart
    chart.update();

}

function getChartObjectById(chart_id) {
    return Object.values(Chart.instances).filter((c) => c.canvas.id == chart_id).pop()
}

function addChartObjectAndHTML(metric_name) {

    const graphs_area = document.getElementById('graphs_area');
    const new_data_div = document.createElement('div');
    new_data_div.className = "data_div";
    new_data_div.id = `${metric_name}_data_div`;

    // Macro elements
    const new_statistics_div = document.createElement('div');
    const new_graph_div = document.createElement('div');
    new_statistics_div.className = "statistics_div";
    new_graph_div.className = "graph_div";
    
    // Statistics columns
    Object.keys(statistics_dict).forEach((statistic_name, index, statistics_list) => {

        const statistic_column = document.createElement('div');
        const statistic_column_title = document.createElement('h3');

        statistic_column.style.width = `${100/statistics_list.length}%`;
        statistic_column.className = "statistic_column";
        statistic_column.id = `${metric_name}_${statistic_name}_column`;
        statistic_column_title.innerHTML = statistic_name;
        statistic_column_title.className = "statistic_title";

        statistic_column.appendChild(statistic_column_title);
        new_statistics_div.appendChild(statistic_column);

    });
    
    // Chart HTML
    const new_graph_canvas = document.createElement('canvas');
    new_graph_canvas.id = metric_name;
    new_graph_div.appendChild(new_graph_canvas);
    
    // Append children
    new_data_div.appendChild(new_statistics_div);
    new_data_div.appendChild(new_graph_div);
    graphs_area.appendChild(new_data_div);
    
    // Create the chart object
    var chart = new Chart(metric_name, {
                                            type: "line",
                                            data: {
                                                    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                                                    datasets: []
                                                },
                                            options: {
                                                maintainAspectRatio: false,
                                                elements: {
                                                    point:{
                                                        radius: 2
                                                    }
                                                },
                                                plugins: {
                                                    legend: {
                                                        onClick: null
                                                    }
                                                },
                                                layout: {
                                                    padding: {
                                                        bottom: 10
                                                    }
                                                }
                                            }
                                        });
    
    return chart;

}

function removeRunFromChart(chart, run_name) {

    var chart_datasets = chart.data.datasets;
    const old_dataset = chart_datasets.filter((dataset) => dataset.label == run_name).pop();
    const index = chart_datasets.indexOf(old_dataset);

    if (index > -1) { // only splice array when item is found
        chart_datasets.splice(index, 1); // 2nd parameter means remove one item only
    }

    chart.update();

}

function assignColor(run_name) {
    /* A function to cycle on the chosen colors palette. */

    hexadecimal_dict[run_name] = hexadecimal_dict[run_name] || hexadecimal_dict.palette_to_consume.pop();       // maintain the color if the run already exists
    if (hexadecimal_dict.palette_to_consume.length == 0) {
        hexadecimal_dict.palette_to_consume = hexadecimal_dict.original_palette
    }

}

function deleteRunFromEveryChart(run_name) {

    const run_dict = JSON.parse( localStorage.getItem(run_name) );
    const metrics_names_array = Object.keys(run_dict);

    metrics_names_array.forEach(metric_name => {

        var chart = getChartObjectById(metric_name);
        var chart_datasets = chart.data.datasets;

        removeRunFromChart(chart, run_name);

        if (chart_datasets.length == 0) {               // delete the entire chart if it remains empty
            document.getElementById(`${metric_name}_data_div`).remove();
            chart.canvas.id = "trash";
        }

        chart.update();

    });

}

function deleteAllRunStatistics(run_name) {

    const run_statistics = document.querySelectorAll(`.${run_name}_statistics`);

    run_statistics.forEach(node => node.remove());

}

function resetDataDivHeight() {

    const statistics_div_list = document.querySelectorAll('.statistics_div');

    // Reset the heights to their natural value
    statistics_div_list.forEach(div => {div.style.height = "";});

    // Compute and set the artificial ones
    for (let i=0; i<(statistics_div_list.length-1); i=i+2) {
        max_height = Math.max(statistics_div_list[i].offsetHeight, statistics_div_list[i+1].offsetHeight);
        statistics_div_list[i].style.height = `${max_height}px`;
        statistics_div_list[i+1].style.height = `${max_height}px`;
    };

}