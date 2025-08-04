

import Image from "next/image";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import LoginForm from "@/components/form/LoginForm";
import SignupForm from "@/components/form/SignUpForm";
import Layout from "./layout";

export default function Home() {
  return (
    <Layout>
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Formulaire */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center py-12 px-6 sm:px-12">
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

            <Tabs defaultValue="Login" className="w-full space-y-6">
              <TabsList className="relative grid w-full h-12 grid-cols-2 bg-gray-100/90 border border-gray-200 rounded-lg p-1">
                {/* Animated background for active tab */}
                <div
                  className="absolute rounded-md h-[calc(100%-8px)] top-1 transition-all duration-300 ease-in-out"
                  style={{
                    width: "calc(50% - 4px)",
                  }}
                />
                <TabsTrigger
                  value="Login"
                  className="relative z-10 data-[state=active]:text-primary rounded-md font-medium transition-colors duration-200"
                >
                  <span className="relative z-20">Connexion</span>
                </TabsTrigger>
                <TabsTrigger
                  value="Signup"
                  className="relative z-10 data-[state=active]:text-primary rounded-md font-medium transition-colors duration-200"
                >
                  <span className="relative z-20">Inscription</span>
                </TabsTrigger>
              </TabsList>

              <div className="relative overflow-hidden min-h-[400px]">
                <TabsContent value="Login" className="rounded-lg">
                  <div className="animate-in fade-in slide-in-from-left-8 duration-300">
                    <LoginForm />
                  </div>
                </TabsContent>

                <TabsContent value="Signup" className="rounded-lg">
                  <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                    <SignupForm />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-50 relative overflow-hidden">
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
