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

            addValueAndDerivativesToChart(metric_name, run_name, metric_data);     // it creates the chart object and the data-div HTML if needed
            getChartObjectById(metric_name).update();

            addStatisticsDivs(metric_name, run_name);
            computeAndAddStatistics(metric_name, run_name);

        });

    });

    resetDataDivHeight();

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
        hide_button.setAttribute('onclick', `hideRun('${run_name}')`);
        hide_button.innerHTML = "hide";
        hide_button.id = `${run_name}_hide_button`;
        hide_button.classList.add("hide_buttons");

        run_name_span.innerHTML += " " + run_name;
        run_name_span.style.backgroundColor = hexadecimal_dict[run_name]['background'];

        new_run.appendChild(del_button);
        new_run.appendChild(hide_button);
        new_run.appendChild(run_name_span);
        experiments_list.appendChild(new_run);
    
    };

}

function addValueAndDerivativesToChart(metric_name, run_name, metric_data) {

    const chart = getChartObjectById(metric_name) || addChartObjectAndHTML(metric_name);
    const values_array = metric_data;
    const epochs_array = _.range(1, metric_data.length+1);
    const chart_datasets = chart.data.datasets;
    const color = hexadecimal_dict[run_name]['face'];
    
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
                            math_version: "values",
                            hidden: !(chart.math_version == "values")
                        });
    chart_datasets.push({
                            label: run_name,
                            data: computeDerivatives(values_array),
                            fill: false,
                            borderColor: color,
                            backgroundColor: color,
                            math_version: "derivatives",
                            hidden: !(chart.math_version == "derivatives")
                        });

}

function computeDerivatives(values) {
    const derivatives = [null];
    for (let i = 1; i < values.length; i++) {
        derivatives.push(values[i] - values[i-1]);
    };
    return derivatives
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
    //// Create one container for the runs names and one for all the statistics columns
    const new_run_names_container = document.createElement('div');
    const new_statistics_container = document.createElement('div');
    //// Set the runs names column
    const h3_button_container = document.createElement('h3');
    const derivatives_button = document.createElement('button');
    h3_button_container.style.textAlign = 'center';
    derivatives_button.type = 'button';
    derivatives_button.innerHTML = "derivatives";
    derivatives_button.setAttribute('onclick', `derivativesValuesSwitch('${metric_name}')`);
    derivatives_button.id = `${metric_name}_switch_button`;
    derivatives_button.classList.add("derivatives_buttons");
    h3_button_container.appendChild(derivatives_button);
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
    
    // Chart HTML
    const new_graph_canvas = document.createElement('canvas');
    const new_y_buttons_div = document.createElement('div');
    const new_y_half_max_button = document.createElement('button');
    const new_y_double_max_button = document.createElement('button');
    const new_y_half_min_button = document.createElement('button');
    const new_y_double_min_button = document.createElement('button');
    new_graph_canvas.id = metric_name;
    new_y_half_max_button.innerHTML = "half y max";
    new_y_half_max_button.setAttribute('onclick', `halfYMax('${metric_name}')`);
    new_y_double_max_button.innerHTML = "double y max";
    new_y_double_max_button.setAttribute('onclick', `doubleYMax('${metric_name}')`);
    new_y_half_min_button.innerHTML = "half y min";
    new_y_half_min_button.setAttribute('onclick', `halfYMin('${metric_name}')`);
    new_y_double_min_button.innerHTML = "double y min";
    new_y_double_min_button.setAttribute('onclick', `doubleYMin('${metric_name}')`);
    new_y_buttons_div.appendChild(new_y_half_max_button);
    new_y_buttons_div.appendChild(new_y_double_max_button);
    new_y_buttons_div.appendChild(new_y_half_min_button);
    new_y_buttons_div.appendChild(new_y_double_min_button);
    new_y_buttons_div.classList.add("y_buttons_divs");
    new_graph_div.appendChild(new_graph_canvas);
    
    // Append children
    new_data_div.appendChild(new_statistics_div);
    new_data_div.appendChild(new_graph_div);
    new_data_div.appendChild(new_y_buttons_div);
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
                                                        onClick: null,
                                                        display: false
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: metric_name
                                                    }
                                                },
                                                layout: {
                                                    padding: {
                                                        bottom: 10
                                                    }
                                                }
                                            }
                                        });
    chart.math_version = "values";
    
    return chart;

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
    statistic_run_name.style.backgroundColor = hexadecimal_dict[run_name]['background'];
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
        statistic_value.style.color = hexadecimal_dict[run_name]['face'];
        statistic_value.style.backgroundColor = hexadecimal_dict[run_name]['background'];
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
    const data = new Blob([text], {type: 'text/plain'});
    textFile = window.URL.createObjectURL(data);
    return textFile;        // returns a URL you can use as a href
}