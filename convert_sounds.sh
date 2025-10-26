#\!/bin/bash

# Controleer of ffmpeg is geïnstalleerd
if \! command -v ffmpeg &> /dev/null; then
    echo "ffmpeg is niet geïnstalleerd. Installeer het eerst:"
    echo "  Mac: brew install ffmpeg"
    echo "  Linux: sudo apt-get install ffmpeg"
    exit 1
fi

# Zorg dat de sounds map bestaat
SOUNDS_DIR="./sounds"
mkdir -p "$SOUNDS_DIR"

# Lijst van verwachte geluidsbestanden voor het spel
EXPECTED_SOUNDS=("jump" "splash" "collect" "puppy" "claw" "dig" "bounce" "fire" "game-over")

# Converteer alle m4a bestanden in de sounds directory naar mp3
echo "Converteren van .m4a naar .mp3 bestanden in de sounds map..."

# Zoek alle .m4a bestanden in de sounds map
for m4a_file in "$SOUNDS_DIR"/*.m4a; do
    if [ -f "$m4a_file" ]; then
        # Haal de bestandsnaam zonder pad en extensie op
        base_name=$(basename "$m4a_file" .m4a)
        
        # Pad naar uitvoerbestand
        mp3_file="$SOUNDS_DIR/${base_name}.mp3"
        
        echo "Converteren: $m4a_file -> $mp3_file"
        ffmpeg -i "$m4a_file" -acodec libmp3lame -ar 44100 -ab 128k -ac 1 "$mp3_file" -y -loglevel error
    fi
done

# Controleer welke geluiden voor het spel aanwezig zijn
echo "Status van geluidsbestanden voor het spel:"
for sound_name in "${EXPECTED_SOUNDS[@]}"; do
    if [ -f "${SOUNDS_DIR}/${sound_name}.mp3" ]; then
        echo "✅ ${sound_name}.mp3 (aanwezig)"
    else
        echo "❌ ${sound_name}.mp3 (ontbreekt)"
    fi
done

echo ""
echo "Alle geluidsbestanden in de sounds map:"
ls -la "$SOUNDS_DIR"

echo ""
echo "Conversie voltooid\!"
echo "Om dit script uit te voeren: chmod +x convert_sounds.sh && ./convert_sounds.sh"
