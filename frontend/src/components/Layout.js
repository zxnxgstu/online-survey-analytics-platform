import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
    return (
        <div className="container-fluid">
            <div className="row min-vh-100">
                <div className="col-12 col-md-3 col-lg-2 bg-light border-end p-0">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-9 col-lg-10 p-0 d-flex flex-column">
                    <Toolbar />
                    <main className="flex-grow-1 p-3">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};


export default Layout;
