import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
console.log("axios.defaults.baseURL", axios.defaults.baseURL);
axios.defaults.withCredentials = true;
export const userLogin = async (email: string, password: string) => {
	try {
		const response = await axios.post("/user/login", { email, password });
		if (response.status !== 200) {
			throw new Error();
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		throw new Error(`Error! Cannot Login. ${err.message}`);
	}
};

export const userSignup = async (
	name: string,
	email: string,
	password: string
) => {
	try {
		const response = await axios.post("/user/signup", {
			name,
			email,
			password,
		});
		const data = await response.data;
		return data;
	} catch (err: any) {
        console.log(err)
		throw new Error(`Error! Cannot Signup. ${err.message}`);
	}
};

export const createNewChat = async () => {
	try {
	  const response = await axios.post("/chat/new-chat", {}, { withCredentials: true });
	  if (response.status !== 201) throw new Error("Failed to create chat");
	  return response.data.chat;
	} catch (err: any) {
	  throw new Error(err.message || "Failed to create chat");
	}
  };
  

export const getAuthStatus = async () => {
	try {
		const response = await axios.get("/user/auth-status", {
			withCredentials: true, // Ensure the cookies are sent with the request
		  });
		if (response.status !== 200) {
			throw new Error("Could not verify authentication status");
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		throw new Error(err.message);
	}
};

export const postChatRequest = async (message: string, chatId: string) => {
	
	try {
	  const response = await axios.post(`/chat/add-message/${chatId}`, { message }, {
		withCredentials: true, // Ensure the cookies are sent with the request
	  });
	  
	  if (response.status !== 200) {
		throw new Error("Request failed with status " + response.status);
	  }
	  
	  return response.data; // Return the data directly (not await on data)
	} catch (err: any) {
	  console.error("Error:", err);
	  throw new Error(err.message || "An error occurred while sending the message.");
	}
  };
  

  export const getChat = async (chatId:string) => {
	try {
		const response = await axios.get(`/chat/get-chat/${chatId}`);
		if (response.status !== 200) {
			throw new Error();
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		console.log(err);
		throw new Error(err.message);
	}
};

export const deleteChatByIdChat = async (chatId:string) => {
	try {
		const response = await axios.delete(`chat/delete/chat/${chatId}`);
		if (response.status !== 200) {
			throw new Error();
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		console.log(err);
		throw new Error(err.message);
	}
};

export const getAllChats = async () => {
	try {
		const response = await axios.get("/chat/all-chats");
		console.log("response", response);
		if (response.status !== 200) {
			throw new Error();
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		console.log(err);
		throw new Error(err.message);
	}
};

export const deleteAllChats = async () => {
	try {
		const response = await axios.delete("/chat/delete-all-chats");
		if (response.status !== 200) {
			throw new Error();
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		console.log(err);
		throw new Error(err.message);
	}
};

export const logoutUser = async () => {
	try {
		const response = await axios.get("/user/logout");
		if (response.status !== 200) {
			throw new Error();
		}
		const data = await response.data;
		return data;
	} catch (err: any) {
		console.log(err);
		throw new Error(err.message);
	}
};
