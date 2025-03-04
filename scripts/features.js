function openNav() {
    /* Open the side menu */

    document.getElementById("experiments_area").style.left = "0%";
    document.getElementById("open_menu_icon").src = "assets/buttons/Icon-Cancel.svg";
    document.getElementById("open_menu_button").onclick = closeNav;
    document.getElementById("graphs_area").style.overflowY = "hidden";

}

function closeNav() {
    /* Close the side menu */

    document.getElementById("experiments_area").style.left = "-100%";
    document.getElementById("open_menu_icon").src = "assets/buttons/Icon-Menu.svg";
    document.getElementById("open_menu_button").onclick = openNav;
    document.getElementById("graphs_area").style.overflowY = "";

}

function gotFiles(input) {
    /* The function that fires when some files are loaded with the Load button. */

    const file_list = Array.from(input.files);

    file_list.forEach((file) => {
        const reader = new FileReader();
        reader.addEventListener("load", reader => saveAndShowFile(JSON.parse(reader.target.result)));      // because asynchrony
        reader.readAsText(file);
    });

    delayedReformatting();

}

function saveAndShowFile(input_dict) {

    // Prepare the view
    document.getElementById("no_exp_message").style.display = 'none';
    hideAllDivs();
    showDataZone();
    buttonDivChartsMode();
    changeMenuBarBGColor('white');

    // Save and show the data
    
    const runs_names_array = Object.keys(input_dict);

    runs_names_array.forEach(run_name => {

        const run_dict = input_dict[run_name];
        const metrics_names_array = Object.keys(run_dict);

        saveRunToLocalStorage(run_name, run_dict);      // data are stored per-run
        assignColor(run_name);
        metrics_names_array.forEach((metric_name) => {

            updateExperimentsListHTML(run_name);

            addValuesToChart(metric_name, run_name, run_dict[metric_name]);   // it creates the chart object and the data-div HTML if needed
            getChartObjectById(metric_name).update();

            addStatisticsDivs(metric_name, run_name);
            computeAndAddStatistics(metric_name, run_name);

        });

        showRun(run_name);   // show the new data if the run was hidden before the upload

    });

}

function switchHideShow(run_name) {
    /* The action triggered by the hide buttons. */

    if (document.getElementById("data_zone").style.display == 'none') {
        backButtonAction();     // to avoid layout glitches
    };

    const run_name_div = document.getElementById(`${run_name}_experiment_li`);
    if (run_name_div.style.backgroundColor != 'rgba(0, 0, 0, 0)') {
        hideRun(run_name);
    } else {    // if the run is already hidden
        showRun(run_name);
    };

}

function showOnlyThisRun(run_name) {
    /* The action triggered when a hide button is double clicked. */

    Object.keys(localStorage).forEach(general_run_name => {
        if (general_run_name == run_name) {
            showRun(general_run_name);
        } else {
            hideRun(general_run_name);
        }
    })

}

function deleteRun(run_name) {
    /* The action triggered by the del buttons. */

    if (document.getElementById("data_zone").style.display == 'none') {
        backButtonAction();     // to avoid layout glitches
    };

    // Delete the item from the experiments list
    document.getElementById(`${run_name}_experiment_li`).remove();

    // Delete the run from every chart
    deleteRunFromEveryChart(run_name);

    // Delete all run statistics
    document.querySelectorAll(`.${run_name}_statistics`).forEach(node => node.remove());

    // Delete the run from localStorage (this has to be the final step)
    localStorage.removeItem(run_name);

    // Restore the now-free color
    hexadecimal_dict.palette_to_consume.push(hexadecimal_dict[run_name]);
    delete hexadecimal_dict[run_name];

    // In desktop mode, reset the height of all the statistics div
    if (window.innerWidth >= desktop_width_limit) {
        resetDataDivHeight();
    }

}

function exportDesk() {
    /* The action triggered by the export button. */

    const visible_runs = getVisibleRuns();
    const link = document.createElement('a');
    var date = new Date();

    date = date.toLocaleDateString().replace(/\//g, '_');
    link.setAttribute('download', `learningcurves_${date}_.json`);
    link.href = makeTextFile(JSON.stringify(visible_runs));
    document.body.appendChild(link);

    window.requestAnimationFrame(function () {
        const event = new MouseEvent('click');
        link.dispatchEvent(event);
        document.body.removeChild(link);
    });

}

function clearDesk() {
    /* Delete all the saved data when the "clear all" button is pressed. */

    Object.keys(localStorage).forEach(deleteRun);

    hideAllDivs();
    showBackgroundImage();
    showLandingMessage();
    buttonDivLoadMode();
    document.getElementById("no_exp_message").style.display = 'block';

    changeMenuBarBGColor('grey');

    localStorage.clear();  // to clear what remains

}

function halfYMax(metric_name) {

    const chart = getChartObjectById(metric_name);
    const chart_ranges = {
                            "y_max": chart.scales['y-axis-0'].max,
                            "y_min": chart.scales['y-axis-0'].min,
                            "x_max": chart.scales['x-axis-0'].max,
                            "x_min": chart.scales['x-axis-0'].min
                        }

    // Save the current zoom levels
    zoom_history[metric_name].push(chart_ranges);

    // Zoom
    chart.options.scales.yAxes[0].ticks.max = (chart_ranges['y_max']+chart_ranges['y_min']) / 2;        // the new y_max is the middle point between the old y_max and y_min

    chart.update();

}

function zoomBack(metric_name) {

    const chart = getChartObjectById(metric_name);
    const zoom_levels = zoom_history[metric_name].pop();

    chart.options.scales.yAxes[0].ticks.max = zoom_levels['y_max'];
    chart.options.scales.yAxes[0].ticks.min = zoom_levels['y_min'];
    chart.options.scales.xAxes[0].ticks.max = zoom_levels['x_max'];
    chart.options.scales.xAxes[0].ticks.min = zoom_levels['x_min'];

    chart.update();

}

async function loadExamples() {

    // Clear the desk
    localStorage.clear();

    // Write the sample data on localStorage
    const sample_data = await fetch('./sample_data.json');
    const sample_data_json = await sample_data.json();
    Object.keys(sample_data_json).forEach(run_name => {
        saveRunToLocalStorage(run_name, sample_data_json[run_name]);
    });

    // Relaunch the app
    window.location.href = "index.html";

}

function dropHandler(ev) {

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // Read the file(s)
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.addEventListener("load", reader => saveAndShowFile(JSON.parse(reader.target.result)));      // because asynchrony
                reader.readAsText(file);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
            const reader = new FileReader();
            reader.addEventListener("load", reader => saveAndShowFile(JSON.parse(reader.target.result)));
            reader.readAsText(file);
        });
    }

    // Reformat the style
    document.getElementById("drop_cartel").style.display = 'none';
    delayedReformatting();

}

function dragOverHandler(ev) {    
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    // Mod the style
    document.getElementById("drop_cartel").style.display = 'block';
}

function delayedReformatting() {
    /* Reformat data_div heights and borders after a delay in order to catch the right dimensions. */

    if (window.innerWidth >= desktop_width_limit) {    // adjust height and borders in desktop mode
        setTimeout(() => {
            resetDataDivHeight();
            resetDataDivBorders();
        }, 200);
    } else {    // adjust only borders in mobile mode
        setTimeout(() => {
            resetDataDivBorders();
        }, 200);
    }

}

function mobileInfoButtonAction() {
    /* The action triggered by the info button in the menu bar, mobile mode. */

    hideAllDivs();
    showBackgroundImage();
    showDataFormatInfo();
    showContactsPage();

    changeMenuBarBGColor('grey');

    closeNav();

    window.scrollTo(0, 0);

}

function backButtonAction() {

    const visible_runs = getVisibleRuns();
    if (Object.keys(visible_runs).length != 0) {     // if there are experiments in the cache
        saveAndShowFile(visible_runs);
        delayedReformatting();
    } else {
        hideAllDivs();
        showBackgroundImage();
        showLandingMessage();
        buttonDivLoadMode();
    };

    // For mobile mode
    window.scrollTo(0, 0);

}