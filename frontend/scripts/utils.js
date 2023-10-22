function saveRunToLocalStorage(run_name, run_dict) {
    // Runs are assumed to be always updated and never taken back to past results
    localStorage.setItem(run_name, JSON.stringify(run_dict));
}

function updateExperimentsListHTML(run_name) {

    const experiments_list = document.getElementById("experiments_list");
    const existing_runs_ids = Array.from(experiments_list.childNodes).map(x => x.id);
    
    if (!existing_runs_ids.includes(`${run_name}_experiment_li`)) {

        const new_run_div = document.createElement('div');
        const run_name_span = document.createElement('span');
        const buttons_div = document.createElement('div');
        const hide_button = document.createElement('button');
        const hide_icon = document.createElement('img');
        const del_button = document.createElement('button');
        const del_icon = document.createElement('img');
                
        new_run_div.id = `${run_name}_experiment_li`;
        new_run_div.style.backgroundColor = hexadecimal_dict[run_name];
        new_run_div.classList.add("exp_list_run_divs");

        run_name_span.innerHTML += " " + run_name;
        run_name_span.id = `${run_name}_experiment_li_span`;
        run_name_span.classList.add("experiment_li_spans");

        buttons_div.classList.add("hideshow_del_button_div");

        hide_button.type = 'button';
        hide_button.title = 'hide run';
        hide_button.setAttribute('onclick', `switchHideShow('${run_name}')`);
        hide_button.setAttribute('ondblclick', `showOnlyThisRun('${run_name}')`);
        hide_button.id = `${run_name}_hide_button`;
        hide_button.classList.add("hide_buttons");
        hide_button.classList.add("hideshow_del_buttons");
        hide_icon.src = "assets/buttons/Icon-Eye-On.svg";
        hide_icon.id = `${run_name}_hide_icon`;
        hide_icon.classList.add("hideshow_del_icons");
        hide_button.appendChild(hide_icon);

        del_button.type = 'button';
        del_button.title = "delete run";
        del_button.setAttribute('onclick', `deleteRun('${run_name}')`);
        del_button.classList.add("del_buttons");
        del_button.classList.add("hideshow_del_buttons");
        del_icon.src = "assets/buttons/Cancel.svg";
        del_icon.classList.add("hideshow_del_icons");
        del_button.appendChild(del_icon);

        buttons_div.appendChild(hide_button);
        buttons_div.appendChild(del_button);

        new_run_div.appendChild(run_name_span);
        new_run_div.appendChild(buttons_div);
        experiments_list.appendChild(new_run_div);
    
    };          // else only the charts will change

}

function addValuesToChart(metric_name, run_name, metric_data) {

    const chart = getChartObjectById(metric_name) || buildDataDiv(metric_name);
    const values_array = metric_data;
    const epochs_array = _.range(1, metric_data.length+1);
    const color = hexadecimal_dict[run_name];
    
    // Remove the old datasets (in case this is an overwriting)
    removeRunDatasetsFromChartObj(metric_name, run_name);
    
    // Update (in case) the x-axis and add the new dataset
    if (chart.data.labels.slice(-1)[0] < epochs_array.slice(-1)[0]) {
        chart.data.labels = epochs_array;
    };
    chart.data.datasets.push({
                            label: run_name,
                            data: values_array,
                            fill: false,
                            borderColor: color,
                            backgroundColor: color});

}

function getChartObjectById(chart_id) {
    return Object.values(Chart.instances).filter((c) => c.canvas.id == chart_id).pop()
}

function buildDataDiv(metric_name) {

    const data_zone = document.getElementById('data_zone');

    const new_data_div = document.createElement('div');
    new_data_div.className = "data_div";
    new_data_div.id = `${metric_name}_data_div`;

    // Macro elements
    const new_title = document.createElement('h2');
    new_title.innerHTML = metric_name;
    const new_graph_div = buildGraphDiv(metric_name);
    const new_hr = document.createElement('hr');
    const new_statistics_and_options_div = buildStatisticAndOptionsDiv(metric_name);
        
    // Append children
    new_data_div.appendChild(new_title);
    new_data_div.appendChild(new_graph_div);
    new_data_div.appendChild(new_hr);
    new_data_div.appendChild(new_statistics_and_options_div);
    data_zone.appendChild(new_data_div);

    // In desktop mode, reassign the background color based on the position on page
    if (window.innerWidth >= 1324) {
        const position = Array.from(document.querySelectorAll('.data_div'))
                        .map(node => node.id)
                        .indexOf(`${metric_name}_data_div`);
        new_data_div.style.backgroundColor = (Math.ceil(position/2) % 2) == 0 ? "#F5F7FF" : "#E9EBF7";
    };
    
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
                                                legend: {
                                                    display: false
                                                },
                                                layout: {
                                                    padding: {
                                                        bottom: 10
                                                    }
                                                },
                                                scales: {
                                                    xAxes: [{
                                                                ticks: {
                                                                    fontFamily: "Inter",
                                                                    fontColor: "#131514",
                                                                    padding: 10
                                                                },
                                                                gridLines: {
                                                                    borderDash: [0.25, 4],
                                                                    color: "#131514",
                                                                    drawBorder: false,
                                                                    zeroLineBorderDash: [0.25, 4],
                                                                    zeroLineColor: "#131514",
                                                                    drawTicks: false
                                                                }
                                                            }],
                                                    yAxes: [{
                                                                ticks: {
                                                                    fontFamily: "Inter",
                                                                    fontColor: "#131514",
                                                                    padding: 10
                                                                },
                                                                gridLines: {
                                                                    borderDash: [0.25, 4],
                                                                    color: "#131514",
                                                                    drawBorder: false,
                                                                    zeroLineBorderDash: [0.25, 4],
                                                                    zeroLineColor: "#131514",
                                                                    drawTicks: false
                                                                }
                                                            }]
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

function buildStatisticAndOptionsDiv(metric_name) {

    const statistics_and_options_div = document.createElement('div');
    statistics_and_options_div.className = "statistics_and_options_div";

    // Statistics table: one column for the runs names and one column for the statistics columns
    const statistics_table = document.createElement('div');
    statistics_table.classList.add("statistics_table");
    //// Runs names column
    const runs_names_column = document.createElement('div');
    const runs_names_column_title = document.createElement('h5');
    runs_names_column_title.innerHTML = "Experiments";
    runs_names_column_title.classList.add("runs_names_title");
    runs_names_column.appendChild(runs_names_column_title);
    runs_names_column.classList.add("statistic_column");
    runs_names_column.classList.add("runs_names_column");
    runs_names_column.id = `${metric_name}_run_name_column`;
    statistics_table.appendChild(runs_names_column);
    //// Statistics columns
    const statistics_columns_container = document.createElement('div');
    statistics_columns_container.classList.add("statistics_columns_container");
    Object.keys(statistics_dict).forEach(statistic_name => {
        
        const statistic_column = document.createElement('div');
        const statistic_column_title = document.createElement('h5');
        
        statistic_column.style.width = `${100/Object.keys(statistics_dict).length}%`;
        statistic_column.className = "statistic_column";
        statistic_column.id = `${metric_name}_${statistic_name}_column`;
        statistic_column_title.innerHTML = statistic_name;
        statistic_column_title.classList.add("statistic_title");
        
        statistic_column.appendChild(statistic_column_title);
        statistics_columns_container.appendChild(statistic_column);
        
    });
    statistics_table.appendChild(statistics_columns_container);

    // Zoom buttons
    const zoom_options_div = document.createElement('div');
    zoom_options_div.classList.add("zoom_options_div");
    //// Title
    const zoom_options_title = document.createElement('h5');
    zoom_options_title.innerHTML = "Zoom";
    //// Buttons
    const buttons_div = document.createElement('div');
    buttons_div.classList.add("zoom_buttons_container");
    const [zoom_button_div_yhalf, zoom_button_div_back] = buildZoomButtons(metric_name);
    buttons_div.appendChild(zoom_button_div_yhalf);
    buttons_div.appendChild(zoom_button_div_back);
    ////
    zoom_options_div.appendChild(zoom_options_title);
    zoom_options_div.appendChild(buttons_div);

    statistics_and_options_div.appendChild(statistics_table);
    statistics_and_options_div.appendChild(zoom_options_div);

    return statistics_and_options_div

}

function buildZoomButtons(metric_name) {

    const zoom_button_div_yhalf = document.createElement('div');
    const y_half_max_button = document.createElement('button');
    const y_half_max_icon = document.createElement('img');
    const zoom_button_div_back = document.createElement('div');
    const zoom_back_button = document.createElement('button');
    const zoom_back_icon = document.createElement('img');

    y_half_max_button.type = 'button';
    y_half_max_button.title = "half y max";
    y_half_max_button.setAttribute('onclick', `halfYMax('${metric_name}')`);
    y_half_max_button.classList.add("zoom_options_buttons");
    y_half_max_button.classList.add("y_max_buttons");
    y_half_max_icon.src = "assets/buttons/Icon-Ymax.svg";
    y_half_max_button.appendChild(y_half_max_icon);

    zoom_back_button.type = 'button';
    zoom_back_button.title = "zoom back";
    zoom_back_button.setAttribute('onclick', `zoomBack('${metric_name}')`);
    zoom_back_button.classList.add("zoom_options_buttons");
    zoom_back_button.classList.add("zoom_back_buttons");
    zoom_back_icon.src = "assets/buttons/Icon-Reset-Zoom.svg";
    zoom_back_button.appendChild(zoom_back_icon);

    zoom_history[metric_name] = [];

    zoom_button_div_yhalf.classList.add("zoom_button_div");
    zoom_button_div_back.classList.add("zoom_button_div");
    zoom_button_div_yhalf.appendChild(y_half_max_button);
    zoom_button_div_back.appendChild(zoom_back_button);

    return [zoom_button_div_yhalf, zoom_button_div_back]
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
    statistic_run_name.classList.add("statistic_row");
    statistic_run_name.classList.add("statistic_run_name");
    document.getElementById(`${metric_name}_run_name_column`).appendChild(statistic_run_name);

    Object.keys(statistics_dict).forEach(statistic_name => {

        const statistic_value = document.createElement('div');

        statistic_value.classList.add("statistic_value");
        statistic_value.classList.add(`${run_name}_statistics`);
        statistic_value.classList.add(`${run_name}_statistics_${metric_name}`);
        statistic_value.classList.add("statistic_row");
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

function hideRun(run_name) {

    const hide_icon = document.getElementById(`${run_name}_hide_icon`);
    const run_name_div = document.getElementById(`${run_name}_experiment_li`);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    // Update the experiment list
    hide_icon.src = "assets/buttons/Icon-Eye-Off.svg";
    run_name_div.style.backgroundColor = 'rgba(0,0,0,0)';

    // Shade all run statistics
    document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.backgroundColor = 'transparent');

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

    const hide_icon = document.getElementById(`${run_name}_hide_icon`);
    const run_name_div = document.getElementById(`${run_name}_experiment_li`);
    const run_dict = JSON.parse( localStorage.getItem(run_name) );

    // Update the experiment list
    hide_icon.src = "assets/buttons/Icon-Eye-On.svg";
    run_name_div.style.backgroundColor = hexadecimal_dict[run_name];

    document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.style.backgroundColor = hexadecimal_dict[run_name]);

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

function resetDataDivBorders() {

    const data_div_list = document.querySelectorAll('.data_div');

    if (window.innerWidth >= 1324) {    // desktop mode

        // Set the borders to their default value
        data_div_list.forEach(div => {div.style.border = "1.5px solid #131514";});

        // Remove the top and bottom border of the first and the last two
        data_div_list[0].style.borderTop = "none";
        data_div_list[1].style.borderTop = "none";
        data_div_list[data_div_list.length-1].style.borderBottom = "none";
        data_div_list[data_div_list.length-2].style.borderBottom = "none";

        // Remove the right border of the odd ones
        data_div_list.forEach((div, index) => {
            if (index % 2 != 0) {
                div.style.borderRight = "none";
            }
        });

    } else {                            // mobile mode

        data_div_list.forEach(div => {div.style.borderBottom = "1.5px solid #131514";});
        data_div_list[data_div_list.length-1].style.borderBottom = "none";

    }

}

function showBackgroundImage() {
    document.getElementById("background_image").style.display = 'block';
}

function hideBackgroundImage() {
    document.getElementById("background_image").style.display = 'none';
}

function showLandingMessage() {
    document.getElementById("landing_message").style.display = 'flex';
}

function hideLandingMessage() {
    document.getElementById("landing_message").style.display = 'none';
}

function showDataFormatInfo() {
    document.getElementById("data_format_message").style.display = 'flex';
}

function hideDataFormatInfo() {
    document.getElementById("data_format_message").style.display = 'none';
}

function showContactsPage() {
    document.getElementById("contacts_page").style.display = 'flex';
}

function hideContactsPage() {
    document.getElementById("contacts_page").style.display = 'none';
}

function showDataZone() {
    document.getElementById("data_zone").style.display = 'flex';
}

function hideDataZone() {
    document.getElementById("data_zone").style.display = 'none';
}

function buttonDivLoadMode() {
    document.getElementById("clear_button").style.display = 'none';
    document.getElementById("export_button").style.display = 'none';
    document.getElementById("data_buttons_div").style.justifyContent = 'center';
}

function buttonDivChartsMode() {
    document.getElementById("clear_button").style.display = 'inline-block';
    document.getElementById("export_button").style.display = 'inline-block';
    document.getElementById("data_buttons_div").style.justifyContent = 'space-between';
}

function hideAllDivs() {
    hideBackgroundImage();
    hideLandingMessage();
    hideDataFormatInfo();
    hideContactsPage();
    hideDataZone();
}