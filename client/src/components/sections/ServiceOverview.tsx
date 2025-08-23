// components/sections/ServiceOverview.tsx
import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { serviceCategories } from '../../data/services';

export const ServiceOverview: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Grow your presence on the world's biggest social media platforms. 
            Real users, instant results, guaranteed quality.
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCategories.map((category) => (
            <Card key={category.platform} hover className="text-center group">
              {/* Platform Icon */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-4xl transform group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>

              {/* Platform Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {category.name}
              </h3>

              {/* Services List */}
              <div className="space-y-3 mb-8">
                {category.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{service.icon}</span>
                      <span className="font-medium text-gray-700">{service.name}</span>
                    </div>
                    <span className="text-sm text-purple-600 font-semibold">
                      ${service.basePrice}/1K
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600"
              >
                View {category.name} Packages
              </Button>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-4 rounded-2xl">
            <span className="text-lg">🔥</span>
            <span className="text-gray-700">
              <span className="font-semibold">Limited Time:</span> Get 20% off your first order
            </span>
            <Button size="sm">
              Claim Discount
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
