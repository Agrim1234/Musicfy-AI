import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import connectDB from "@/db/connectDb";
import User from "@/models/User";


const handler = NextAuth({
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        // ...add more providers here
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //     authorization: {
        //         params: {
        //             prompt: "consent",
        //             access_type: "offline",
        //             response_type: "code"
        //         }
        //     }
        // })
    ],
    secret: process.env.SECRET,
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            try {
                
                if (account && account.provider === "github") {
                    //connect to the database
                    // connectDB();
    
                    // //check if user already exist in database
                    // const currentUser = await User.findOne({ email: user.email })
                    // console.log(currentUser)
    
                    // if (!currentUser) {
                    //     //console.log(email)
                    //     const newUser = new User({
                    //         email: user.email,
                    //         username: user.email?.split("@")[0],
                    //     })
                    //     //console.log(newUser)
                    //     await newUser.save()
        
                    // }
    
                    return true;
                }
            } catch (error) {
                console.log(error)
                return false;
            }
            return false;
        },
        async session({ session, user, token }) {
            // const dbUser = await User.findOne({email: session.user?.email})
            // console.log(dbUser, dbUser.username, "checking")
            // if(session.user){
            //     session.user.name = dbUser.username ? dbUser.username : '';
            // }

            return session
        },
    }
    // callbacks: {
    //     async jwt({ token, account }) {
    //         // Persist the OAuth access_token to the token right after signin
    //         if (account) {
    //             token.accessToken = account.access_token
    //         }
    //         return token
    //     },
    //     async session({ session, token, user }) {
    //         // Send properties to the client, like an access_token from a provider.
    //         session.accessToken = token.accessToken
    //         return session
    //     }
    // }
})

export { handler as GET, handler as POST }
