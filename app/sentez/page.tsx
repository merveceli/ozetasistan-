import { redirect } from 'next/navigation';

// /sentez artık /capraz-okuma ile birleştirildi
export default function SentezRedirect() {
    redirect('/capraz-okuma');
}
