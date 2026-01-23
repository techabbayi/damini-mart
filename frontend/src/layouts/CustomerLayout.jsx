import { Outlet } from 'react-router-dom';
import Header from '../components/customer/Header';
import Footer from '../components/customer/Footer';

export default function CustomerLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
