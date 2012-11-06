class BrowserMatrix
  require 'open-uri'
  require 'uri'
  require 'json'

  attr_accessor :token, :id

  CLEANUP = [
    {
      key: /BlackBerry[0-9]+/,
      browser: 'BlackBerry',
      version: lambda { |row| return 'all' }
    },
    {
      key: /Android Browser/,
      browser: 'Android Browser',
      version: lambda { |row|
        version = row[2].split('.');
        if version[0].to_i < 533 
          return ' < 2.2';
        elsif version[0] == '533'
          '2.2 or 2.3';
        elsif version[0] == '534' && version[1] == '13'
          '3.2.1'
        elsif version[0].to_i >= 534
          ' >= 4.0'
        end
      }
    },
    {
      key: /Chrome/,
      browser: 'Chrome',
      version: lambda { |row| return row[2].split('.')[0] }
    },
    {
      key: /Firefox/,
      browser: 'Firefox',
      version: lambda { |row| return row[2].split('.')[0] }
    },
    {
      key: /Internet Explorer/,
      browser: 'Internet Explorer',
      version: lambda { |row| return row[2] }
    },
    { 
      key: /nokia/i,
      browser: 'Nokia',
      version: lambda { |row| 'all' }
    },
    {
      key: /Safari/,
      browser: 'Safari', 
      version: lambda { |row| 
        version = row[2].split('.')
        if version[0] == '8536'
          'iOS 6'
        elsif version[0] == '7534'
          'iOS 5'
        elsif version[0] == '6533'
          'iOS 4'
        elsif version[0] == '533'
          '5'
        elsif version[0] == '534'
          '5.1'
        elsif version[0] == '536'
          '6'
        else
          version[0];
        end
      }
    },
    { 
      key: /SAMSUNG-GT.*/,
      browser: 'Samsung-GT',
      version: lambda { |row| 'all' }
    }
  ]

  def initialize(token, id)
    @token = token
    @id = id
  end

  def buildUrl(dimensions=nil, metrics=nil, startDate=nil, endDate=nil)
    return "https://www.googleapis.com/analytics/v3/data/ga?ids=#{URI.escape(@id)}&dimensions=#{URI.escape(dimensions)}&metrics=#{URI.escape(metrics)}&start-date=#{URI.escape(startDate)}&end-date=#{URI.escape(endDate)}&max-results=10000&access_token=#{URI.escape(@token)}"
  end

  def getBrowsers
    url = buildUrl(dimensions='ga:operatingSystem,ga:browser,ga:browserVersion', metics='ga:visitors', startDate='2012-10-20', endDate='2012-11-03')
    data = cleanup(JSON.parse(open(url).read))

    rowsFromHash(data)
  end


  def rowsFromHash(hash)
    rows = []
    hash.each do |os, browsers|
      browsers.each do |browser, versions|
        versions.each do |version,  hits|
          rows << [os, browser, version, hits]
        end
      end
    end
    rows
  end

  def cleanup(data)
    cleanData = {}

    data['rows'].inject({}) do |cleanData, row|
      found = false
      CLEANUP.each do |browser|
        if browser[:key] =~ row[1]
          found = true
          cleanData = addDataToHash(cleanData, row[0], browser[:browser], browser[:version].call(row), row[3])
        end
      end
      if found === false
        cleanData = addDataToHash(cleanData, row[0], row[1], 'all', row[3]);
      end
      cleanData
    end
  end

  def addDataToHash(cleanData, os, browser, version, count)
    os = cleanOS(os);
    if cleanData[os] == nil
      cleanData[os] = {}
    end
    if cleanData[os][browser] == nil
        cleanData[os][browser] = {}
    end
    if cleanData[os][browser][version] == nil
      cleanData[os][browser][version] = 0
    end
    cleanData[os][browser][version] += count.to_i
    cleanData;
  end

  def cleanOS(value)
    if value == 'Windows' || value == 'Macintosh' || value == 'Linux'
      'Desktop'
    else
      value
    end
  end
end
