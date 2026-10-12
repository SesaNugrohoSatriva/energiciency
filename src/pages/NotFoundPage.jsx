import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Halaman Tidak Ditemukan" description="URL yang diminta tidak tersedia di dashboard Energiciency." />
      <section className="panel empty-state-panel">
        <h2>404</h2>
        <p>Halaman yang Anda cari tidak tersedia.</p>
        <Link to="/" className="button button-primary">Kembali ke Dashboard</Link>
      </section>
    </>
  );
}
