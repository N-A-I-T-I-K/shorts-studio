"""One-time helper: give every script its own theme and 8 scene background queries.
Safe to re-run: it only sets `theme` and `photo_query`, never narration text.
"""
import json
import os

MAP = {
    # slug: (theme id, [8 Openverse photo queries])
    "script": ("brick_to_fold", [
        "1970s brick mobile phone", "1980s cellular car phone", "old mobile phone keypad",
        "1990s flip phone", "2007 smartphone touchscreen", "android phone app icons",
        "smartphone camera lens", "foldable futuristic phone",
    ]),
    "script_cars": ("chrome_autobahn", [
        "1886 benz patent motorwagen", "ford model t 1920", "1950s chrome tail fins car",
        "1970s compact car", "toyota prius hybrid", "tesla roadster electric car",
        "modern suv car", "futuristic self driving car",
    ]),
    "script_cpu": ("silicon_foundry", [
        "intel 4004 microprocessor", "vintage computer circuit board", "intel 8086 processor",
        "1990s computer motherboard", "pentium processor chip", "multicore cpu closeup",
        "smartphone processor chip", "ai accelerator silicon wafer",
    ]),
    "script_demo": ("web_dawn", [
        "ford model t 1920s", "vintage mainframe computer 1960s", "old computer terminal 1970s",
        "early mobile phone 1970s", "cern geneva laboratory", "people using laptops cafe",
        "person holding smartphone", "earth from space night lights",
    ]),
    "script_gta": ("neon_underworld", [
        "neon city night lights", "retro arcade cabinet", "open world city videogame",
        "neon miami sunset palms", "dark rainy city street", "los angeles skyline sunset",
        "game controller neon", "futuristic night skyline",
    ]),
    "script_internet": ("packet_routes", [
        "vintage mainframe computer", "old computer terminal screen", "network cables server room",
        "early web browser computer", "world map network connections", "social media laptops",
        "smartphone streaming", "satellite earth from space",
    ]),
    "script_internet3d": ("digital_frontier", [
        "glowing network cables", "old computer terminal green screen", "data center servers",
        "world wide web coding screen", "fiber optic lights", "crowd using smartphones",
        "phone streaming apps", "earth satellite constellation",
    ]),
    "script_rocket_fire": ("ember_ascent", [
        "rocket launch fire night", "spacecraft orbit earth", "apollo moon landing",
        "space shuttle booster launch", "falcon 9 rocket launch", "rocket booster landing",
        "starship rocket launch", "starfield deep space",
    ]),
    "script_ocean": ("abyssal_blue", [
        "deep ocean underwater", "research ship at sea", "deep sea submersible",
        "hydrothermal vent chimney", "giant squid", "underwater coral reef",
        "ocean floor map", "blue planet from space",
    ]),
    "script_psychology": ("mind_circuit", [
        "human brain neurons", "memory notebook", "first impression portrait",
        "human silhouette thinking", "night city window light", "crowd of people",
        "neural network glowing", "abstract human mind",
    ]),
    "script_blackholes": ("event_horizon", [
        "black hole illustration", "einstein chalkboard equations", "astronomer telescope night",
        "milky way galaxy core", "spacetime fabric grid", "spiral galaxy",
        "quantum particles glow", "star field deep space",
    ]),
    "script_body": ("living_machine", [
        "human cells microscope", "heart anatomy", "human hair macro",
        "human skeleton xray", "human skin macro", "dna helix",
        "water drop human silhouette", "human body silhouette",
    ]),
    "script_ai": ("synthetic_dawn", [
        "AI neural network glowing", "server room racks", "robot hand",
        "digital art painting", "code on screen", "robot face",
        "futuristic city tech", "human and robot together",
    ]),
    "script_money": ("gilded_ledger", [
        "dollar bill macro", "gold bars vault", "inflation price tags",
        "shopping street market", "bank building interior", "bitcoin coin",
        "coins stacking growth", "global currency exchange",
    ]),
    "script_time": ("deep_epoch", [
        "big bang cosmos", "young earth planet", "primitive life microscope",
        "early human silhouette", "ancient humans cave", "farm fields aerial",
        "city timelapse night", "hourglass sand",
    ]),
    "script_animals": ("wild_sensorium", [
        "wildlife diversity jungle", "dolphin underwater", "bee on flower macro",
        "snake closeup", "octopus underwater", "sloth on tree",
        "tardigrade microscope", "animal eyes macro",
    ]),
    "script_food": ("flavor_lab", [
        "five taste buds tongue", "red chili peppers", "crispy food closeup",
        "ice cream scoop", "bread rising dough", "grilled meat searing",
        "family dinner table", "childhood kitchen memory",
    ]),
    "script_weather": ("storm_front", [
        "lightning storm night", "desert heat haze", "snowy mountain forest",
        "rainforest rainfall", "wind storm trees", "snowflake macro",
        "blue sky clouds", "dramatic storm clouds",
    ]),
    "script_sleep": ("nocturnal_reset", [
        "person sleeping night", "sleep cycle brain waves", "bedroom moonlight",
        "dream abstract night", "brain neurons night", "tired person morning",
        "bed clock night", "peaceful night sky",
    ]),
    "script_mars": ("red_dust", [
        "mars planet surface", "mars rover desert", "olympus mars volcano",
        "mars robot exploration", "mars orbit spacecraft", "phobos moon mars",
        "red martian soil", "mars sunrise horizon",
    ]),
    "script_volcanoes": ("magma_core", [
        "volcano eruption night", "earth core molten illustration", "lava flow closeup",
        "volcanic ash cloud", "yellowstone geyser", "volcano aerial crater",
        "volcano night glow", "mountain eruption smoke",
    ]),
    "script_dinosaurs": ("jurassic_echo", [
        "dinosaur silhouette sunset", "asteroid impact illustration", "dark dusty sky",
        "feathered dinosaur fossil", "fossil excavation", "t rex skeleton museum",
        "dinosaur footprint fossil", "modern bird perched",
    ]),
    "script_music": ("resonant_wave", [
        "sound waves abstract", "headphones neon", "music equalizer lights",
        "concert crowd lights", "vinyl record closeup", "baby listening music",
        "bird singing branch", "piano keys dark",
    ]),
    "script_color": ("prism_shift", [
        "prism rainbow light", "color spectrum abstract", "blue sky gradient",
        "color blindness test", "blue gold dress", "mantis shrimp macro",
        "color paint swatches", "neon light abstract",
    ]),
    "script_germs": ("microscopic_swarm", [
        "bacteria microscope", "gut microbiome illustration", "intestine anatomy",
        "virus microscope", "soap and water hands", "fever thermometer",
        "cells dividing microscope", "probiotic yogurt",
    ]),
    "script_electricity": ("volt_current", [
        "electric power lines night", "battery cells", "nerve neurons electrical",
        "electric eel underwater", "static electricity spark", "power grid pylons",
        "solar panels wind turbines", "lightning circuit glow",
    ]),
    "script_trees": ("forest_network", [
        "ancient giant tree", "forest canopy aerial", "tree roots underground",
        "forest sunlight rays", "tree trunk rings", "city street trees",
        "misty forest rain", "tree seedling hands",
    ]),
    "script_laughter": ("sunlit_mirth", [
        "people laughing together", "friends laughing cafe", "baby smiling laughing",
        "rats playing", "smiling portrait sunlight", "happy crowd concert",
        "comedy stage lights", "sunrise joyful silhouette",
    ]),
}

changed = 0
for slug, (theme, queries) in MAP.items():
    path = f"tools/{slug}.json"
    if not os.path.exists(path):
        print("MISSING", path)
        continue
    data = json.load(open(path, encoding="utf8"))
    if isinstance(data, list):
        data = {"voice": "en-US-GuyNeural", "rate": "+8%", "pitch": "+0Hz", "scenes": data}
    data["theme"] = theme
    for i, sc in enumerate(data["scenes"]):
        sc["photo_query"] = queries[i]
    with open(path, "w", encoding="utf8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    changed += 1

print("updated", changed, "scripts")
