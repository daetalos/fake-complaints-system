import { Link } from 'react-router-dom';

const Layout = ({ children }: { children: React.ReactNode }) => (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/complaints/new">Submit Complaint</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <main>{children}</main>
    </div>
  );

  export default Layout; 