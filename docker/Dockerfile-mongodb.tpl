FROM --platform=linux/{ARCH} mongo:5
CMD mongod --repair; mongod --bind_ip_all 
