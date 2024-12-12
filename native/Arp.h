#pragma once

#include <string>
#include <sstream>
#include <array>
#include <atomic>

struct Node {
    int pitches[4];
    int currentIndex;
    int cycleCounter;
    int cycleLength = 1;
};

class Arp {
public:
    Arp() : currentBufferIndex(0) {
        // Initialize both buffers
        for (auto& buffer : buffers) {
            for (int i = 0; i < 16; ++i) {
                buffer.notes[i].currentIndex = 0;
                buffer.notes[i].cycleCounter = 0;
                buffer.notes[i].cycleLength = 2;
                for (int j = 0; j < 4; ++j) {
                    buffer.notes[i].pitches[j] = 0;
                }
            }
        }
    }

    // UI thread: write operations
    void noteUp(int index) {
        int writeBufferIndex = 1 - currentBufferIndex.load(std::memory_order_relaxed);

        // Copy current buffer to write buffer
        buffers[writeBufferIndex] = buffers[currentBufferIndex.load(std::memory_order_acquire)];

        // Modify the write buffer
        int& currentPitch = buffers[writeBufferIndex].notes[index].pitches[buffers[writeBufferIndex].notes[index].currentIndex];
        currentPitch += 1;

        // Atomically swap buffers
        currentBufferIndex.store(writeBufferIndex, std::memory_order_release);
    }

    void noteDown(int index) {
        int writeBufferIndex = 1 - currentBufferIndex.load(std::memory_order_relaxed);

        // Copy current buffer to write buffer
        buffers[writeBufferIndex] = buffers[currentBufferIndex.load(std::memory_order_acquire)];

        // Modify the write buffer
        int& currentPitch = buffers[writeBufferIndex].notes[index].pitches[buffers[writeBufferIndex].notes[index].currentIndex];
        currentPitch -= 1;

        // Atomically swap buffers
        currentBufferIndex.store(writeBufferIndex, std::memory_order_release);
    }

    // Audio thread: read operations
    int getPitch(int step, int pitchIndex) const {
        int readBufferIndex = currentBufferIndex.load(std::memory_order_acquire);
        return buffers[readBufferIndex].notes[step].pitches[pitchIndex];
    }

    void updateCycleLength(int step, int change) {
        int writeBufferIndex = 1 - currentBufferIndex.load(std::memory_order_relaxed);

        // Copy current buffer to write buffer
        buffers[writeBufferIndex] = buffers[currentBufferIndex.load(std::memory_order_acquire)];

        // Modify the write buffer
        buffers[writeBufferIndex].notes[step].cycleLength += change;

        // Atomically swap buffers
        currentBufferIndex.store(writeBufferIndex, std::memory_order_release);
    } 

    // Serialize to JSON
    std::string toJson() const {
        std::stringstream ss;
        int readBufferIndex = currentBufferIndex.load(std::memory_order_acquire);
        const auto& notes = buffers[readBufferIndex].notes;

        ss << "{\"steps\":[";
        for (int i = 0; i < 16; ++i) {
            ss << "{\"pitches\":[";
            for (int j = 0; j < notes[i].cycleLength; ++j) {
                ss << notes[i].pitches[j];
                if (j < notes[i].cycleLength - 1) ss << ",";
            }
            ss << "]}";
            if (i < 15) ss << ",";
        }
        ss << "]}";
        return ss.str();
    }

private:
    struct Buffer {
        Node notes[16];
    };

    std::array<Buffer, 2> buffers;
    std::atomic<int> currentBufferIndex; // 0 or 1
};