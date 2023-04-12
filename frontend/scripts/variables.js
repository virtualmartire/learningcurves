const colors_palette = [{"face": "#fec600", "background": "#ffe999"},
                        {"face": "#954a97", "background": "#dcbbdd"},
                        {"face": "#e50064", "background": "#ff99c5"},
                        {"face": "#009ee3", "background": "#99e0ff"},
                        {"face": "#f39100", "background": "#ffd699"},
                        {"face": "#13a538", "background": "#a4f4b8"},
                        {"face": "#e3001f", "background": "#ff99a7"},
                        {"face": "#0863b5", "background": "#9dcffb"}];

const statistics_dict = {
    "max": a => Math.max(...a),
    "min": a => Math.min(...a)
};

const zoom_history = {};