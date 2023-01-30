const hexadecimal_dict = {
                            "palette": ["#0863b5", "#e3001f", "#13a538", "#f39100", "#009ee3", "#e50064", "#954a97", "#fec600"],
                            "counter": 0
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

function hideRun(run_name) {

    var hide_button = document.getElementById(`${run_name}_hide_button`);
    var run_exp_list_item = document.getElementById(run_name);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );
    const metrics_names_array = Object.keys(run_dict);

    if (hide_button.innerHTML == "hide") {

        // Update the experiment list
        hide_button.innerHTML = "show";
        run_exp_list_item.style.color = 'gray';

        // Delete the run on every chart
        metrics_names_array.forEach(metric_name => {

            var chart = getChartObjectById(metric_name);
            var chart_datasets = chart.data.datasets;

            removeRunFromChart(chart, run_name);
            if (chart_datasets.length == 0) {               // delete the entire chart if it remains empty
                document.getElementById(chart.canvas.id).remove();
                chart.canvas.id = "trash";
            }
            chart.update();

        });

    } else {

        hide_button.innerHTML = "hide";
        run_exp_list_item.style.color = 'black';

        metrics_names_array.forEach((metric_name) => {
            const metric_data = run_dict[metric_name];
            drawCurve(metric_name, run_name, metric_data);
        });

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
                                                maintainAspectRatio: false,
                                                elements: {
                                                    point:{
                                                        radius: 2
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
    /* A function to cycle on the colors palette defined at the top of this file. */

    const palette = hexadecimal_dict.palette;

    hexadecimal_dict[run_name] = palette[hexadecimal_dict.counter % palette.length];
    hexadecimal_dict.counter++;

}