import pretty_midi
import os

midi_dir = "split_midi"
output_file = "combined_slow.mid"

SLOW_FACTOR = 1.5  # ↑ increase to slow more (e.g., 2.0)

combined = pretty_midi.PrettyMIDI()
current_time = 0.0

for file in sorted(os.listdir(midi_dir)):
    if file.endswith(".mid"):
        pm = pretty_midi.PrettyMIDI(os.path.join(midi_dir, file))

        for instrument in pm.instruments:
            new_inst = pretty_midi.Instrument(program=instrument.program)
            for note in instrument.notes:
                new_inst.notes.append(
                    pretty_midi.Note(
                        velocity=note.velocity,
                        pitch=note.pitch,
                        start=(note.start + current_time) * SLOW_FACTOR,
                        end=(note.end + current_time) * SLOW_FACTOR
                    )
                )
            combined.instruments.append(new_inst)

        current_time += pm.get_end_time()

combined.write(output_file)
print("Slower combined MIDI created:", output_file)
