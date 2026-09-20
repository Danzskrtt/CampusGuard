import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RequestRoute() {
	const { id } = useLocalSearchParams<{ id: string }>();

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Request Details</Text>
			<Text style={styles.subtitle}>Request ID: {id}</Text>
			<TouchableOpacity style={styles.button} onPress={() => router.back()}>
				<Text style={styles.buttonText}>Back</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', backgroundColor: '#F7F8FA', justifyContent: 'center', padding: 24 },
	title: { color: '#111827', fontSize: 24, fontWeight: '800', marginBottom: 8 },
	subtitle: { color: '#6B7280', fontSize: 14, marginBottom: 24, textAlign: 'center' },
	button: { backgroundColor: '#1B2A4A', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
	buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
