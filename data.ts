import { Product } from './types';

// Fixed Categories as per user request
export const categoriesList = [
  'পুরুষদের ফ্যাশন', 
  'নারীদের ফ্যাশন', 
  'ইলেকট্রনিক্স ও গ্যাজেট', 
  'গৃহস্থালী ও লিভিং',
  'বিউটি ও পার্সোনাল কেয়ার', 
  'খেলাধুলা ও ফিটনেস', 
  'কিডস ও টয়েজ', 
  'গিফট ও স্টেশনারি'
];

export const products: Product[] = Array.from({ length: 30 }, (_, i) => {
  const id = (i + 1).toString();
  let category = categoriesList[i % categoriesList.length];
  let name = `প্রোডাক্ট ${id}`;
  let description = "এটি একটি অত্যন্ত উচ্চমানের পণ্য যা আপনার দৈনন্দিন জীবনকে আরো সহজ এবং সুন্দর করে তুলবে। টেকসই উপাদান দিয়ে তৈরি এবং দীর্ঘস্থায়ী।";
  let price = 500 + (i * 150);
  
  // Customizing some items to look real
  if (i === 0) { name = "প্রিমিয়াম পাঞ্জাবি"; price = 2500; description = "ঈদের জন্য সেরা কালেকশন, ১০০% কটন।"; category = categoriesList[0]; }
  if (i === 1) { name = "জামদানি শাড়ি"; price = 5500; description = "ঐতিহ্যবাহী হাতে বোনা জামদানি শাড়ি।"; category = categoriesList[1]; }
  if (i === 2) { name = "স্মার্ট ওয়াচ আল্ট্রা"; price = 3500; description = "ব্লুটুথ কলিং এবং হেলথ ট্র্যাকিং সহ।"; category = categoriesList[2]; }
  if (i === 3) { name = "নন-স্টিক কুকওয়্যার সেট"; price = 4200; description = "৭ পিসের সেট, রান্না হবে সহজ।"; category = categoriesList[3]; }
  if (i === 4) { name = "ময়েশ্চারাইজিং লোশন"; price = 450; description = "শীতের রুক্ষতা থেকে মুক্তি।"; category = categoriesList[4]; }
  if (i === 5) { name = "ডাম্বেল সেট (৫ কেজি)"; price = 1500; description = "ঘরে জিম করার জন্য পারফেক্ট।"; category = categoriesList[5]; }
  if (i === 6) { name = "রিমোট কন্ট্রোল কার"; price = 1200; description = "বাচ্চাদের জন্য দ্রুতগতির খেলনা গাড়ি।"; category = categoriesList[6]; }
  if (i === 7) { name = "লাক্সারি গিফট বক্স"; price = 850; description = "প্রিয়জনকে উপহার দেওয়ার জন্য সেরা।"; category = categoriesList[7]; }
  
  const mainImage = `https://picsum.photos/seed/${id}/600/600`;
  
  return {
    id,
    name,
    price,
    originalPrice: price + (price * 0.2), // 20% higher for discount effect
    category,
    description,
    image: mainImage,
    images: [
        mainImage,
        `https://picsum.photos/seed/${id}extra1/600/600`,
        `https://picsum.photos/seed/${id}extra2/600/600`
    ],
    stock: Math.random() > 0.1, // 90% in stock
    features: [
      "উচ্চ গুণমান সম্পন্ন",
      "১ বছরের ওয়ারেন্টি",
      "দ্রুত ডেলিভারি সুবিধা",
      "সহজ রিটার্ন পলিসি"
    ],
    status: 'Active'
  };
});