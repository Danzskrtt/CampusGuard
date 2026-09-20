import { RequestsProvider } from '@/features/student/context/RequestsContext';
import HomeDashboardScreen from '@/features/student/screens/HomeDashboardScreen';
import MyRequestsScreen from '@/features/student/screens/MyRequestsScreen';
import NewRequestScreen from '@/features/student/screens/NewRequestScreen';
import NotificationsScreen from '@/features/student/screens/NotificationsScreen';
import QRPassScreen from '@/features/student/screens/QRPassScreen';
import RequestDetailScreen from '@/features/student/screens/RequestDetailScreen';
import { useRouter } from 'expo-router';
import { useState } from 'react';

interface Props {
  onLogout?: () => void;
}

export default function MainStack({ onLogout }: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState('Home');
  const [params, setParams] = useState<any>();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const navigation = {
    navigate: (name: string, nextParams?: any) => {
      setParams(nextParams);
      if (name === 'RequestDetail' || name === 'QRPass') setSelectedRequestId(nextParams?.requestId ?? null);
      setScreen(name);
    },
    goBack: () => setScreen('Home'),
    replace: (name: string, nextParams?: any) => {
      setParams(nextParams);
      setScreen(name);
    },
  };

  const content = (() => {
    switch (screen) {
      case 'NewRequest':
        return <NewRequestScreen navigation={navigation} route={{ params }} />;
      case 'MyRequests':
        return <MyRequestsScreen navigation={navigation} route={undefined} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigation} />;
      case 'RequestDetail':
        return <RequestDetailScreen navigation={navigation} route={{ params: { requestId: selectedRequestId ?? '' } }} />;
      case 'QRPass':
        return <QRPassScreen navigation={navigation} route={{ params: { requestId: selectedRequestId ?? '' } }} />;
      default:
        return <HomeDashboardScreen navigation={navigation} onLogout={() => onLogout?.() ?? router.replace('/login')} />;
    }
  })();

  return (
    <RequestsProvider>{content}</RequestsProvider>
  );
}
