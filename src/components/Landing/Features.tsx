import Image from 'next/image'
import { Eye } from 'lucide-react'
import React from 'react'

const Features = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#212121]">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-xl text-[#e16540] mb-4">FEATURES</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/80">
            Analytics that bring insights, not confusion
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="bg-[#282828] border-8 border-[#383838] rounded-xl">
          <div className="">
            <Image
              src={"/image.png"}
              height={200}
              width={200}
              alt="Step 1"
              className="w-full h-full rounded-t-lg"
            />
          </div>
          <div className="p-6">
            <Eye className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Real-time tracking</h3>
            <p className="text-gray-400">
              See exactly where your visitors come from and what they do on
              your site, in real-time.
            </p>
          </div>
        </div>

        <div className="bg-[#282828] border-8 border-[#383838] rounded-xl">
          <div className="h-1/2">
            <Image
              src={"/image.png"}
              height={200}
              width={400}
              alt="Step 2"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="h-1/2 p-6">
            <Eye className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Real-time tracking</h3>
            <p className="text-gray-400">
              See exactly where your visitors come from and what they do on
              your site, in real-time.
            </p>
          </div>
        </div>

        <div className="bg-[#282828] border-8 border-[#383838] rounded-xl">
          <div className="h-1/2">
            <Image
              src={"/image.png"}
              height={200}
              width={400}
              alt="Step 3"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="h-1/2 p-6">
            <Eye className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Real-time tracking</h3>
            <p className="text-gray-400">
              See exactly where your visitors come from and what they do on
              your site, in real-time.
            </p>
          </div>
        </div>

        <div className="bg-[#282828] border-8 border-[#383838] rounded-xl">
          <div className="h-1/2">
            <Image
              src={"/image.png"}
              height={200}
              width={400}
              alt="Step 4"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="h-1/2 p-6">
            <Eye className="w-8 h-8 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Real-time tracking</h3>
            <p className="text-gray-400">
              See exactly where your visitors come from and what they do on
              your site, in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
}

export default Features