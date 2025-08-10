import Image from "next/image";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import LoginForm from "@/components/form/LoginForm";
// import SignupForm from "@/components/form/SignUpForm";
import Layout from "./layout";

export default function Home() {
  return (
    <Layout>
      <div className="h-screen bg-white">
        <div className="flex flex-col lg:flex-row w-full h-full bg-white shadow-xl overflow-hidden">
          {/* Partie gauche */}
          <div className="lg:w-1/2 flex flex-col items-center justify-center py-12 px-6 sm:px-12 h-full">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center mb-8">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={180}
                  height={180}
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>

              <Tabs defaultValue="Login" className="w-full h-full flex flex-col">
                <div className="relative overflow-hidden flex-grow">
                  <TabsContent value="Login" className="h-full">
                    <div className="animate-in fade-in slide-in-from-left-8 duration-300 h-full">
                      <LoginForm />
                    </div>
                  </TabsContent>

                  {/* <TabsContent value="Signup" className="h-full">
                    <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full">
                      <SignupForm />
                    </div>
                  </TabsContent> */}
                </div>
              </Tabs>
            </div>
          </div>

          {/* Partie droite */}
          <div className="hidden lg:flex lg:w-1/2 bg-gray-50 relative h-full">
            <Image
              src="/images/login_image.jpg"
              alt="Illustration"
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </div>
    </Layout>
  );
}