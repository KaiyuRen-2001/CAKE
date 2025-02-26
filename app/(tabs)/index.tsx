import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Info } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SHOWS = [
  {
    id: 1,
    title: 'The Bachelor',
    image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=200&fit=crop',
  },
  {
    id: 2,
    title: 'The Office',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200&fit=crop',
  },
  {
    id: 3,
    title: 'The Rookie',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&fit=crop',
  },
  {
    id: 4,
    title: 'Parks and Recreation',
    image: 'https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?w=200&fit=crop',
  },
  {
    id: 5,
    title: 'Supernatural',
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=200&fit=crop',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What can we help{'\n'}you catch up on?</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Info size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a show"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Past Summaries</Text>

      <ScrollView style={styles.showsGrid} contentContainerStyle={styles.showsGridContent}>
        {SHOWS.map((show) => (
          <Pressable
            key={show.id}
            style={styles.showCard}
            onPress={() => router.push(`/show/${show.id}`)}>
            <Image source={{ uri: show.image }} style={styles.showImage} />
            <Text style={styles.showTitle}>{show.title}</Text>
          </Pressable>
        ))}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  infoButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  showsGrid: {
    flex: 1,
  },
  showsGridContent: {
    padding: 20,
  },
  showCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  showTitle: {
    fontSize: 16,
    fontWeight: '500',
    padding: 12,
  },
});