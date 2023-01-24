import json

input_list = ["data/FeA_deep_validation.json", "data/carlo_df_validation.json"]
output_list = ["data/FeA_deep.json", "data/carlo_df.json"]

for input_path, output_path in zip(input_list, output_list):

    with open(input_path) as json_file:
        array = json.load(json_file)

    kcalmolRMSE_val = []
    for list_ in array:
        kcalmolRMSE_val.append( [list_[-2], list_[-1]] )

    dict_ = {output_path[5:-5]: {"kcalmolRMSE_val": kcalmolRMSE_val}}
    with open(output_path, 'w') as json_file:
        json.dump(dict_, json_file)