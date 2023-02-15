FROM llaske/multiarch-mongodb:{ARCH}
CMD mongod --repair; mongod --bind_ip_all 
