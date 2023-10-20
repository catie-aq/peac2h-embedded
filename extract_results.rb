require "json"

# if ARGV.length != 1
#   puts "Usage: ruby extract_result.rb <filename>  , default is db.json"
#   exit
# end

filename = ARGV[0] || "db.json"
file = File.open(filename)

file_data = file.read

## Parse the JSON data into a hash

data = JSON.parse(file_data)

out = {}
subjects = data["subjects"] 
final_data = subjects.map do |subject|
  s = {} 
  s["subject_id"] = subject["id"]
  result = {}

  subject.each do |key, value| 
    if(key.start_with?("result-S")) 
      result = result.merge(value)
    end
  end
  
  s["result"] = result 
  s
end


File.open("results.json", "w") do |f|
  f.write(JSON.pretty_generate(final_data))
end