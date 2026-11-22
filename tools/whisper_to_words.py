import json, sys
d = json.load(open(sys.argv[1], encoding="utf8"))
words = [{"text": w["word"].strip(), "start": w["start"], "end": w["end"]}
         for s in d["segments"] for w in s.get("words", [])]
json.dump(words, open(sys.argv[2], "w", encoding="utf8"), ensure_ascii=False)
print(len(words), "words")
