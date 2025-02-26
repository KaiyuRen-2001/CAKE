import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type DurationOption = '30 sec' | '1 min' | '5 min';
type SpeedOption = '1x' | '1.5x' | '2x';
type FormatOption = 'Video' | 'Audio';

export default function ShowScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>('1 min');
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedOption>('1x');
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>('Video');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Suits</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Season</Text>
            <Pressable style={styles.select}>
              <Text style={styles.selectText}>Choose a season</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Episode</Text>
            <Pressable style={styles.select}>
              <Text style={styles.selectText}>Choose an episode</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>How long would you like the summary to be?</Text>
            <View style={styles.optionsContainer}>
              {(['30 sec', '1 min', '5 min'] as DurationOption[]).map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.option,
                    selectedDuration === duration && styles.optionSelected,
                  ]}
                  onPress={() => setSelectedDuration(duration)}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedDuration === duration && styles.optionTextSelected,
                    ]}>
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>How fast would you like the summary to be?</Text>
            <View style={styles.optionsContainer}>
              {(['1x', '1.5x', '2x'] as SpeedOption[]).map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.option,
                    selectedSpeed === speed && styles.optionSelected,
                  ]}
                  onPress={() => setSelectedSpeed(speed)}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedSpeed === speed && styles.optionTextSelected,
                    ]}>
                    {speed}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Format of summary</Text>
            <View style={styles.optionsContainer}>
              {(['Video', 'Audio'] as FormatOption[]).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.option,
                    styles.formatOption,
                    selectedFormat === format && styles.optionSelected,
                  ]}
                  onPress={() => setSelectedFormat(format)}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedFormat === format && styles.optionTextSelected,
                    ]}>
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.generateButton}>
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  select: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectText: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formatOption: {
    flex: 0.485,
  },
  optionSelected: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  optionTextSelected: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#1a237e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});