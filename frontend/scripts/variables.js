const colors_palette = ['#C9A3A4',
                        '#FFC887',
                        '#A7EFEB',
                        '#BEA7EF',
                        '#BAEFA7',
                        '#EFA7A7',
                        '#EFDFA7',
                        '#EEA7EF',
                        '#A7CEEF',
                        '#C49C6D'];

const statistics_dict = {
    "Max": a => Math.max(...a),
    "Min": a => Math.min(...a)
};

const zoom_history = {};

const desktop_width_limit = 1170;   // 1180 is the logical pixels width of an iPad 10