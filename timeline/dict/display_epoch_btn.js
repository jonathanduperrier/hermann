var display_epoch_btn = [
{name : "1 Alfaxan", displayEpoch : 0},
{name : "2 Esmeron", displayEpoch : 0},
{name : "3 phys", displayEpoch : 0},
{name : "4 Env", displayEpoch : 0},
{name : "5 Electrode", displayEpoch : 1, dependency : 0},
{name : "6 Neuron", displayEpoch : 1, dependency : "5 Electrode"},
{name : "7 Protocol", displayEpoch : 1, dependency: "6 Neuron"},
]
