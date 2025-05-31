import {
	userLogin,
	getAuthStatus,
	logoutUser,
	userSignup,
  } from "../../helpers/api-functions";
  import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
  } from "react";
  
  // ==================
  // Type Definitions
  // ==================
  type User = {
	name: string;
	email: string;
  };
  
  type UserAuth = {
	user: User | null;
	isLoggedIn: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
  };
  
  // ==================
  // Dummy Default Context Value
  // ==================
  const defaultAuthContext: UserAuth = {
	user: null,
	isLoggedIn: false,
	login: async () => {},
	signup: async () => {},
	logout: async () => {},
  };
  
  // ==================
  // Create Context
  // ==================
  export const AuthContext = createContext<UserAuth>(defaultAuthContext);
  
  // ==================
  // AuthProvider Component
  // ==================
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
  
	useEffect(() => {
	  const checkAuthStatus = async () => {
		try {
		  const data = await getAuthStatus();
		  if (data) {
			setUser({ email: data.email, name: data.name });
			setIsLoggedIn(true);
		  }
		} catch (err) {
		  console.error("Auth check failed:", err);
		}
	  };
	  checkAuthStatus();
	}, []);
  
	const login = async (email: string, password: string) => {
	  const data = await userLogin(email, password);
	  if (data) {
		setUser({ email: data.email, name: data.name });
		setIsLoggedIn(true);
	  }
	};
  
	const signup = async (name: string, email: string, password: string) => {
	  await userSignup(name, email, password);
	};
  
	const logout = async () => {
	  await logoutUser();
	  setUser(null);
	  setIsLoggedIn(false);
	  window.location.reload(); // You can optionally redirect instead
	};
  
	return (
	  <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout }}>
		{children}
	  </AuthContext.Provider>
	);
  };
  
  // ==================
  // useAuth Hook
  // ==================
  export const useAuth = () => useContext(AuthContext);
  