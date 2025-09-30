function parseFeature(feature,level) {
  let resarry = feature.split("::").slice(0,level);
  //console.log(resarry)
  return resarry ; 
}

function hierarchicalSimilarity(features1, features2, level) {
  // Assign weights for levels
  const weights = [3, 2, 1];

  function computeSimilarity(levels1, levels2) {
      let score = 0;
      for (let i = 0; i < levels1.length && i < levels2.length; i++) {
          if (levels1[i] === levels2[i]) {
              score += weights[i] || 0;
          } else {
              break; // Stop on the first mismatch
          }
      }
      return score;
  }

  let totalScore = 0;
  let maxScore = features1.length * features2.length * weights.reduce((a, b) => a + b, 0);

  features1.forEach(f1 => {
      features2.forEach(f2 => {
          const levels1 = parseFeature(f1, level);
          const levels2 = parseFeature(f2, level);
          totalScore += computeSimilarity(levels1, levels2);
      });
  });

  return maxScore > 0 ? totalScore / maxScore : 0;
} 

function buildDistanceMatrix(data, level) {
  const n = data.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
          const similarity = hierarchicalSimilarity(data[i], data[j],level);
          matrix[i][j] = 1 - similarity; // Distance = 1 - Similarity
      }
  }

  return matrix;
}

function agglomerativeClustering(distanceMatrix, numClusters) {
  const n = distanceMatrix.length;
  const clusters = Array.from({ length: n }, (_, i) => [i]); // Start with each item in its own cluster

  while (clusters.length > numClusters) {
      let minDist = Infinity;
      let mergeA = 0, mergeB = 0;

      // Find the two closest clusters
      for (let i = 0; i < clusters.length; i++) {
          for (let j = i + 1; j < clusters.length; j++) {
              const dist = clusterDistance(clusters[i], clusters[j], distanceMatrix);
              if (dist < minDist) {
                  minDist = dist;
                  mergeA = i;
                  mergeB = j;
              }
          }
      }

      // Merge the two clusters
      clusters[mergeA] = clusters[mergeA].concat(clusters[mergeB]);
      clusters.splice(mergeB, 1);
  }

  return clusters;

  function clusterDistance(clusterA, clusterB, matrix) {
      let totalDist = 0;
      clusterA.forEach(a => {
          clusterB.forEach(b => {
              totalDist += matrix[a][b];
          });
      });
      return totalDist / (clusterA.length * clusterB.length);
  }
}




//--------------------------------
function hierarchicalSimilarity2(features1, features2) {
  // Ensure inputs are arrays
  if (!Array.isArray(features1)) features1 = [features1];
  if (!Array.isArray(features2)) features2 = [features2];

  const weights = [3, 2, 1]; // Weights for levels

  function computeSimilarity2(levels1, levels2) {
    let score = 0;
    for (let i = 0; i < levels1.length && i < levels2.length; i++) {
      if (levels1[i] === levels2[i]) {
        score += weights[i] || 0;
      } else {
        break; // Stop at the first mismatch
      }
    }
    return score;
  }

  let totalScore = 0;
  let maxScore = features1.length * features2.length * weights.reduce((a, b) => a + b, 0);

  features1.forEach(f1 => {
    features2.forEach(f2 => {
      const levels1 = parseFeature(f1);
      const levels2 = parseFeature(f2);
      totalScore += computeSimilarity2(levels1, levels2);
    });
  });

  return maxScore > 0 ? totalScore / maxScore : 0;
}

function buildDistanceMatrix2(data,level) {
  const n = data.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) { // Only compute upper triangle
      const similarity = hierarchicalSimilarity2(data[i], data[j],level);
      const distance = 1 - similarity; // Distance = 1 - Similarity
      matrix[i][j] = distance;
      matrix[j][i] = distance; // Symmetric matrix
    }
  }

  return matrix;
}

function agglomerativeClustering2(distanceMatrix, numClusters) {
  const n = distanceMatrix.length;
  const clusters = Array.from({ length: n }, (_, i) => [i]);

  while (clusters.length > numClusters) {
    let minDist = Infinity;
    let mergeA = 0, mergeB = 0;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const dist = clusterDistance2(clusters[i], clusters[j], distanceMatrix);
        if (dist < minDist) {
          minDist = dist;
          mergeA = i;
          mergeB = j;
        }
      }
    }

    clusters[mergeA] = clusters[mergeA].concat(clusters[mergeB]);
    clusters.splice(mergeB, 1);
  }

  return clusters;

  function clusterDistance2(clusterA, clusterB, matrix) {
    let totalDist = 0;
    clusterA.forEach(a => {
      clusterB.forEach(b => {
        totalDist += matrix[a][b];
      });
    });
    return totalDist / (clusterA.length * clusterB.length);
  }
}
//-------------------------------------

// Step 5: Output as JSON Object
function generateClusterJson(data, clusters) {
  const result = {};

  clusters.forEach((cluster, clusterId) => {
      cluster.forEach(itemIndex => {
          const key = data[itemIndex].join("\r\n");
          result[key] = clusterId;
      });
  });

  return result;
}

function generateClusterJson2(data, clusters) {
  const result = {};

 //console.log(data)

  clusters.forEach((cluster, clusterId) => {
    //console.log(cluster)
      cluster.forEach(itemIndex => {
        //console.log(data[itemIndex])
          const key = data[itemIndex];
          result[key] = clusterId;
      });
  });
  return result;
}

 

export function EventTagGetEventArray (data, level){
  var eventsArray = data.map(d => d.eventTags).flat();
  let eventTagsArray = eventsArray
      .map(item => item.split('\r\n')    
    ) // Split each string into an array of event tags
  
    if(level ==2){
      eventTagsArray = eventsArray
      .map(item => item.split('::').slice(0,level).join('::')    
      ) // Split each string into an array of event tags 
    }
     

//console.log("eventTagsArrayeventTagsArray",eventTagsArray)
  return eventTagsArray
}

export function EventTagHierarchyGrouping (data,numClusters,level){
  // Example data
/*const data = [
  ["a::1::1", "a::2::1"],
  ["a::1::2", "a::2::1"],
  ["a::1::1"],
  ["a::1::1", "a::1::2"],
  ["a::2::1", "b::1::1"],
  ["a::2::1", "b::1::2"],
  ["a::2::1", "b::2::1"],
  ["c::1::1"],
  ["c::1::1", "b::1::1"]
];*/
let clusterJson = {}
if(level==3){
  // Build the distance matrix
  const distanceMatrix = buildDistanceMatrix(data, level);

  // Perform clustering
  //const numClusters = 5; // Adjust as needed
  const clusters = agglomerativeClustering(distanceMatrix, numClusters);
  clusterJson = generateClusterJson(data, clusters);
  // Display the results
  //clusters.forEach((cluster, index) => {
      //console.log(`Cluster ${index + 1}:`);
      //cluster.forEach(i => console.log(`  ${data[i]}`));
  //});
}
if(level==2){
  const distanceMatrix = buildDistanceMatrix2(data, level);

  // Perform clustering
  //const numClusters = 5; // Adjust as needed
  //console.log(data)
  const clusters = agglomerativeClustering2(distanceMatrix, numClusters);
  clusterJson = generateClusterJson2(data, clusters);
}

return clusterJson
}
