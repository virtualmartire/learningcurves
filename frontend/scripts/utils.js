function saveAndShowFile(input_dict) {

    const runs_names_array = Object.keys(input_dict);

    runs_names_array.forEach(run_name => {

        const run_dict = input_dict[run_name];
        const metrics_names_array = Object.keys(run_dict);

        saveRunToLocalStorage(run_name, run_dict);      // data are stored per-run
        assignColor(run_name);
        metrics_names_array.forEach((metric_name) => {

            const metric_data = run_dict[metric_name];

            updateExperimentsListHTML(run_name);

            addValuesToChart(metric_name, run_name, metric_data);     // it creates the chart object and the data-div HTML if needed
            getChartObjectById(metric_name).update();

            addStatisticsDivs(metric_name, run_name);
            computeAndAddStatistics(metric_name, run_name);

        });

    });

    setTimeout(() => {      // in order to catch the right heights
        resetDataDivHeight();
    }, 300);

}

function saveRunToLocalStorage(run_name, run_dict) {
    // Runs are assumed to be always updated and never taken back to past results
    localStorage.setItem(run_name, JSON.stringify(run_dict));
}

function updateExperimentsListHTML(run_name) {

    const experiments_list = document.getElementById("experiments_list");
    const existing_runs_ids = Array.from(experiments_list.childNodes).map(x => x.id);
    
    if (!existing_runs_ids.includes(`${run_name}_experiment_li`)) {

        const new_run = document.createElement('div');
        const del_button = document.createElement('button');
        const hide_button = document.createElement('button');
        const run_name_span = document.createElement('span');
                
        new_run.id = `${run_name}_experiment_li`;

        del_button.type = 'button';
        del_button.setAttribute('onclick', `deleteRun('${run_name}')`);
        del_button.innerHTML = "del";

        hide_button.type = 'button';
        hide_button.setAttribute('onclick', `switchHideShow('${run_name}')`);
        hide_button.setAttribute('ondblclick', `showOnlyThisRun('${run_name}')`);
        hide_button.innerHTML = "hide";
        hide_button.id = `${run_name}_hide_button`;
        hide_button.classList.add("hide_buttons");

        run_name_span.innerHTML += " " + run_name;
        run_name_span.style.backgroundColor = hexadecimal_dict[run_name];
        run_name_span.id = `${run_name}_experiment_li_span`;

        new_run.appendChild(del_button);
        new_run.appendChild(hide_button);
        new_run.appendChild(run_name_span);
        experiments_list.appendChild(new_run);
    
    };

}

function addValuesToChart(metric_name, run_name, metric_data) {

    const chart = getChartObjectById(metric_name) || buildDataDiv(metric_name);
    const values_array = metric_data;
    const epochs_array = _.range(1, metric_data.length+1);
    const chart_datasets = chart.data.datasets;
    const color = hexadecimal_dict[run_name];
    
    // Remove the old datasets (in case this is an overwriting)
    removeRunDatasetsFromChartObj(metric_name, run_name);
    
    // Update the x-axis
    if (chart.data.labels.slice(-1)[0] < epochs_array.slice(-1)[0]) {
        chart.data.labels = epochs_array;
    }

    // Add the two versions of the dataset
    chart_datasets.push({
                            label: run_name,
                            data: values_array,
                            fill: false,
                            borderColor: color,
                            backgroundColor: color,
                            math_version: "values"
                        });

}

function getChartObjectById(chart_id) {
    return Object.values(Chart.instances).filter((c) => c.canvas.id == chart_id).pop()
}

function buildDataDiv(metric_name) {

    const graphs_area = document.getElementById('graphs_area');

    const new_data_div = document.createElement('div');
    new_data_div.className = "data_div";
    new_data_div.id = `${metric_name}_data_div`;

    // Macro elements
    const new_title = document.createElement('h2');
    new_title.innerHTML = metric_name;
    const new_graph_div = buildGraphDiv(metric_name);
    const new_hr = document.createElement('hr');
    const new_statistics_div = buildStatisticDiv(metric_name);
        
    // Append children
    new_data_div.appendChild(new_title);
    new_data_div.appendChild(new_graph_div);
    new_data_div.appendChild(new_hr);
    new_data_div.appendChild(new_statistics_div);
    graphs_area.appendChild(new_data_div);

    // Assign the background color based on the position on page
    const position = Array.from(document.querySelectorAll('.data_div'))
                    .map(node => node.id)
                    .indexOf(`${metric_name}_data_div`);
    new_data_div.style.backgroundColor = (Math.ceil(position/2) % 2) == 0 ? "#F5F7FF" : "#E9EBF7";
    
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
                                                        onClick: null,
                                                        display: false
                                                    },
                                                    zoom: {
                                                        zoom: {
                                                            drag: {
                                                                enabled: true,
                                                                backgroundColor: 'rgba(150,150,150,0.3)'
                                                            },
                                                            onZoomStart: () => {
                                                                // Save the current zoom levels
                                                                zoom_history[metric_name].push(extractChartRanges(getChartObjectById(metric_name)));
                                                            }
                                                        }
                                                    }
                                                },
                                                layout: {
                                                    padding: {
                                                        bottom: 10
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        ticks: {
                                                            font: {
                                                                family: "Inter"
                                                            },
                                                            color: "#131514",
                                                            padding: 10
                                                        },
                                                        grid: {
                                                            borderDash: [0.25, 4],
                                                            color: "#131514",
                                                            tickLength: 0
                                                        }
                                                    },
                                                    y: {
                                                        ticks: {
                                                            font: {
                                                                family: "Inter"
                                                            },
                                                            color: "#131514",
                                                            padding: 10
                                                        },
                                                        grid: {
                                                            borderDash: [0.25, 4],
                                                            color: "#131514",
                                                            tickLength: 0
                                                        }
                                                    }
                                                }
                                            }
                                        });
    
    return chart;

}

function buildGraphDiv(metric_name) {

    const new_graph_div = document.createElement('div');
    const new_graph_canvas = document.createElement('canvas');

    new_graph_div.className = "graph_div";
    new_graph_canvas.id = metric_name;
    new_graph_div.appendChild(new_graph_canvas);

    return new_graph_div

}

function buildStatisticDiv(metric_name) {

    const new_statistics_div = document.createElement('div');
    new_statistics_div.className = "statistics_div";

    // Statistics columns
    //// Create one container for the runs names and one for all the statistics columns
    const new_run_names_container = document.createElement('div');
    const new_statistics_container = document.createElement('div');
    //// Set the runs names column
    const h3_button_container = document.createElement('h3');
    h3_button_container.style.textAlign = 'center';
    const new_y_half_max_button = document.createElement('button');
    new_y_half_max_button.type = 'button';
    new_y_half_max_button.innerHTML = "half y max";
    new_y_half_max_button.setAttribute('onclick', `halfYMax('${metric_name}')`);
    const zoom_back_button = document.createElement('button');
    zoom_back_button.type = 'button';
    zoom_back_button.innerHTML = "zoom back";
    zoom_back_button.setAttribute('onclick', `zoomBack('${metric_name}')`);
    zoom_history[metric_name] = [];
    h3_button_container.appendChild(new_y_half_max_button);
    h3_button_container.appendChild(zoom_back_button);
    new_run_names_container.appendChild(h3_button_container);
    new_run_names_container.classList.add("statistic_column");
    new_run_names_container.classList.add("statistic_run_names");
    new_run_names_container.id = `${metric_name}_run_name_column`;
    new_statistics_div.appendChild(new_run_names_container);
    //// Set the statistics columns
    const statistics_names_list = Object.keys(statistics_dict);
    statistics_names_list.forEach(statistic_name => {
        
        const statistic_column = document.createElement('div');
        const statistic_column_title = document.createElement('h3');
        
        statistic_column.style.width = `${100/statistics_names_list.length}%`;
        statistic_column.className = "statistic_column";
        statistic_column.id = `${metric_name}_${statistic_name}_column`;
        statistic_column_title.innerHTML = statistic_name;
        statistic_column_title.className = "statistic_title";
        
        statistic_column.appendChild(statistic_column_title);
        new_statistics_container.appendChild(statistic_column);
        
    });
    new_statistics_container.classList.add("statistics_container");
    new_statistics_div.appendChild(new_statistics_container);

    return new_statistics_div

}

function removeRunDatasetsFromChartObj(metric_name, run_name) {

    const chart_datasets = getChartObjectById(metric_name).data.datasets;
    const old_datasets = chart_datasets.filter((dataset) => dataset.label == run_name);

    old_datasets.forEach(dataset => {
        const index = chart_datasets.indexOf(dataset);
        chart_datasets.splice(index, 1); // 2nd parameter means remove one item only
    });

}

function assignColor(run_name) {
    /* A function to cycle on the chosen colors palette. */

    hexadecimal_dict[run_name] = hexadecimal_dict[run_name] || hexadecimal_dict.palette_to_consume.pop();       // maintain the color if the run already exists
    if (hexadecimal_dict.palette_to_consume.length == 0) {
        hexadecimal_dict.palette_to_consume = hexadecimal_dict.original_palette
    }

}

function addStatisticsDivs(metric_name, run_name) {

    // Remove the old divs (in case this is an overwriting)
    document.querySelectorAll(`.${run_name}_statistics_${metric_name}`).forEach(node => node.remove());
    
    const statistic_run_name = document.createElement('div');

    statistic_run_name.innerHTML = run_name;
    statistic_run_name.style.backgroundColor = hexadecimal_dict[run_name];
    statistic_run_name.classList.add(`${run_name}_statistics`);
    statistic_run_name.classList.add(`${run_name}_statistics_${metric_name}`);
    statistic_run_name.classList.add("statistics_rows");
    document.getElementById(`${metric_name}_run_name_column`).appendChild(statistic_run_name);

    Object.keys(statistics_dict).forEach(statistic_name => {

        const statistic_value = document.createElement('div');

        statistic_value.classList.add("statistic_value");
        statistic_value.classList.add(`${run_name}_statistics`);
        statistic_value.classList.add(`${run_name}_statistics_${metric_name}`);
        statistic_value.classList.add("statistics_rows");
        statistic_value.id = `${run_name}_statistics_${metric_name}_${statistic_name}`;
        statistic_value.style.backgroundColor = hexadecimal_dict[run_name];
        document.getElementById(`${metric_name}_${statistic_name}_column`).appendChild(statistic_value);

    });
    
}

function computeAndAddStatistics(metric_name, run_name) {
    /* Compute and write the statistics of the displayed curve of _run_name_ in the _metric_name_ chart_. */

    Object.keys(statistics_dict).forEach(statistic_name => {
        const statistic_value_cell = document.getElementById(`${run_name}_statistics_${metric_name}_${statistic_name}`);
        const displayed_curve = getChartObjectById(metric_name).data.datasets.filter(
                                            dataset => (dataset.label == run_name && !dataset.hidden)
                                    ).pop().data;
        statistic_value_cell.innerHTML = statistics_dict[statistic_name](displayed_curve).toFixed(3);
    });

}

function resetDataDivHeight() {

    const data_div_list = document.querySelectorAll('.data_div');

    // Reset the heights to their natural value
    data_div_list.forEach(div => {div.style.height = "";});

    // Compute and set the artificial ones
    for (let i=0; i<(data_div_list.length-1); i=i+2) {
        max_height = Math.max(data_div_list[i].offsetHeight, data_div_list[i+1].offsetHeight);
        data_div_list[i].style.height = `${max_height}px`;
        data_div_list[i+1].style.height = `${max_height}px`;
    };

}

function deleteRunFromEveryChart(run_name) {

    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    Object.keys(run_dict).forEach(metric_name => {

        const chart = getChartObjectById(metric_name);

        removeRunDatasetsFromChartObj(metric_name, run_name);

        if (chart.data.datasets.length == 0) {               // delete the entire chart if it remains empty
            document.getElementById(`${metric_name}_data_div`).remove();
            chart.canvas.id = "trash";
        }

        chart.update();

    });

}

function makeTextFile(text) {
    // Utils for the export function

    const data = new Blob([text], {type: 'text/plain'});
    textFile = window.URL.createObjectURL(data);
    return textFile;        // returns a URL you can use as a href

}

function extractChartRanges(chart) {

    return {
        "y_max": chart.scales.y._range.max,
        "y_min": chart.scales.y._range.min,
        "x_max": chart.scales.x._range.max,
        "x_min": chart.scales.x._range.min
    }

}

function hideRun(run_name) {

    const hide_button = document.getElementById(`${run_name}_hide_button`);
    const run_name_span = document.getElementById(`${run_name}_experiment_li_span`);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    // Update the experiment list
    hide_button.innerHTML = "show";
    run_name_span.style.color = 'gray';
    run_name_span.style.backgroundColor = null;

    // Hide all run statistics
    document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.display = 'none');

    // Hide the run from every chart
    Object.keys(run_dict).forEach(metric_name => {

        const chart = getChartObjectById(metric_name);

        try {
            chart.data.datasets.filter((dataset) => dataset.label == run_name)[0].hidden = true;
        } catch (error) {
            console.error(error);
        }
        chart.update();

    });

}

function showRun(run_name) {

    const hide_button = document.getElementById(`${run_name}_hide_button`);
    const run_name_span = document.getElementById(`${run_name}_experiment_li_span`);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    hide_button.innerHTML = "hide";
    run_name_span.style.color = 'black';
    run_name_span.style.backgroundColor = hexadecimal_dict[run_name]['background'];

    document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.display = 'block');

    Object.keys(run_dict).forEach(metric_name => {

        const chart = getChartObjectById(metric_name);

        try {
            chart.data.datasets.filter((dataset) => dataset.label == run_name)[0].hidden = false;
        } catch (error) {
            console.error(error);
        }
        chart.update();
        
    });

}