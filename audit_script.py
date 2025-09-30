import os
import json
from datetime import datetime

def check_compromised_packages():
    # List of compromised packages
    compromised_packages = {
        'backslash': 'all',
        'chalk-template': 'all', 
        'supports-hyperlinks': 'all',
        'has-ansi': 'all',
        'simple-swizzle': 'all',
        'color-string': 'all',
        'error-ex': 'all',
        'color-name': 'all',
        'is-arrayish': 'all',
        'slice-ansi': 'all',
        'color-convert': 'all',
        'wrap-ansi': 'all',
        'ansi-regex': 'all',
        'supports-color': 'all',
        'strip-ansi': 'all',
        'chalk': 'all',
        'debug': 'all',
        'ansi-styles': 'all',
        'angulartics2': '14.1.2',
        '@ctrl/deluge': '7.2.2',
        '@ctrl/golang-template': '1.4.3',
        '@ctrl/magnet-link': '4.0.4',
        '@ctrl/ngx-codemirror': '7.0.2',
        '@ctrl/ngx-csv': '6.0.2',
        '@ctrl/ngx-emoji-mart': '9.2.2',
        '@ctrl/ngx-rightclick': '4.0.2',
        '@ctrl/qbittorrent': '9.7.2',
        '@ctrl/react-adsense': '2.0.2',
        '@ctrl/shared-torrent': '6.3.2',
        '@ctrl/tinycolor': '4.1.1,4.1.2',
        '@ctrl/torrent-file': '4.1.2',
        '@ctrl/transmission': '7.3.1',
        '@ctrl/ts-base32': '4.0.2',
        'encounter-playground': '0.0.5',
        'json-rules-engine-simplified': '0.2.4,0.2.1',
        'koa2-swagger-ui': '5.11.2,5.11.1',
        '@nativescript-community/gesturehandler': '2.0.35',
        '@nativescript-community/sentry': '4.6.43',
        '@nativescript-community/text': '1.6.13',
        '@nativescript-community/ui-collectionview': '6.0.6',
        '@nativescript-community/ui-drawer': '0.1.30',
        '@nativescript-community/ui-image': '4.5.6',
        '@nativescript-community/ui-material-bottomsheet': '7.2.72',
        '@nativescript-community/ui-material-core': '7.2.76',
        '@nativescript-community/ui-material-core-tabs': '7.2.76',
        'ngx-color': '10.0.2',
        'ngx-toastr': '19.0.2',
        'ngx-trend': '8.0.1',
        'react-complaint-image': '0.0.35',
        'react-jsonschema-form-conditionals': '0.3.21',
        'react-jsonschema-form-extras': '1.0.4',
        'rxnt-authentication': '0.0.6',
        'rxnt-healthchecks-nestjs': '1.0.5',
        'rxnt-kue': '1.0.7',
        'swc-plugin-component-annotate': '1.9.2',
        'ts-gaussian': '3.0.6'
    }

    results = {
        'timestamp': datetime.now().isoformat(),
        'frontend': {},
        'backend': {},
        'overall': {}
    }

    def check_directory(directory_path, dir_name):
        print(f"\n{'='*50}")
        print(f"Checking {dir_name}")
        print(f"{'='*50}")
        
        dir_results = {
            'directory': directory_path,
            'found': False,
            'total_packages': 0,
            'compromised_count': 0,
            'compromised_packages': [],
            'compromised_percent': 0,
            'safe_percent': 100
        }
        
        if not os.path.exists(directory_path):
            print(f"Directory {directory_path} not found!")
            return dir_results
        
        dir_results['found'] = True
        compromised_found = []
        total_packages = 0
        
        # Walk through node_modules
        for root, dirs, files in os.walk(directory_path):
            # Check if current directory is a package
            if 'package.json' in files:
                total_packages += 1
                package_name = os.path.basename(root)
                
                # Try to read package.json to get version
                try:
                    with open(os.path.join(root, 'package.json'), 'r') as f:
                        package_data = json.load(f)
                        version = package_data.get('version', 'unknown')
                except:
                    version = 'unknown'
                
                # Check if package is compromised
                if package_name in compromised_packages:
                    expected_versions = compromised_packages[package_name]
                    if expected_versions == 'all' or version in expected_versions:
                        compromised_found.append(f"{package_name}@{version}")
        
        # Store results
        dir_results['total_packages'] = total_packages
        dir_results['compromised_count'] = len(compromised_found)
        dir_results['compromised_packages'] = compromised_found
        
        # Print results
        print(f"Total packages found: {total_packages}")
        print(f"Compromised packages found: {len(compromised_found)}")
        
        if compromised_found:
            print("\nCompromised packages:")
            for pkg in compromised_found:
                print(f"  - {pkg}")
        
        # Calculate percentages
        if total_packages > 0:
            compromised_percent = (len(compromised_found) / total_packages) * 100
            safe_percent = 100 - compromised_percent
            print(f"\nCompromised: {compromised_percent:.2f}%")
            print(f"Safe: {safe_percent:.2f}%")
            
            dir_results['compromised_percent'] = round(compromised_percent, 2)
            dir_results['safe_percent'] = round(safe_percent, 2)
        else:
            print("\nNo packages found to analyze")
        
        return dir_results

    # Check frontend and backend
    frontend_results = check_directory('./frontend/node_modules', 'Frontend')
    backend_results = check_directory('./backend/node_modules', 'Backend')
    
    # Store in results
    results['frontend'] = frontend_results
    results['backend'] = backend_results
    
    # Overall summary
    print(f"\n{'='*50}")
    print("OVERALL SUMMARY")
    print(f"{'='*50}")
    
    total_packages = frontend_results['total_packages'] + backend_results['total_packages']
    total_compromised = frontend_results['compromised_count'] + backend_results['compromised_count']
    
    overall_results = {
        'total_packages': total_packages,
        'total_compromised': total_compromised,
        'compromised_percent': 0,
        'safe_percent': 100
    }
    
    if total_packages > 0:
        overall_compromised_percent = (total_compromised / total_packages) * 100
        overall_safe_percent = 100 - overall_compromised_percent
        
        print(f"Total packages: {total_packages}")
        print(f"Total compromised: {total_compromised}")
        print(f"Overall compromised: {overall_compromised_percent:.2f}%")
        print(f"Overall safe: {overall_safe_percent:.2f}%")
        
        overall_results['compromised_percent'] = round(overall_compromised_percent, 2)
        overall_results['safe_percent'] = round(overall_safe_percent, 2)
    else:
        print("No packages found in either directory")
    
    results['overall'] = overall_results
    
    # Save results to file
    save_results_to_file(results)
    
    return results

def save_results_to_file(results):
    filename = f"package_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    
    with open(filename, 'w') as f:
        f.write("PACKAGE AUDIT REPORT\n")
        f.write("=" * 50 + "\n")
        f.write(f"Audit Date: {results['timestamp']}\n")
        f.write("\n")
        
        # Frontend results
        f.write("FRONTEND AUDIT\n")
        f.write("-" * 30 + "\n")
        frontend = results['frontend']
        if frontend['found']:
            f.write(f"Total Packages: {frontend['total_packages']}\n")
            f.write(f"Compromised: {frontend['compromised_count']}\n")
            f.write(f"Compromised Percentage: {frontend['compromised_percent']}%\n")
            f.write(f"Safe Percentage: {frontend['safe_percent']}%\n")
            if frontend['compromised_packages']:
                f.write("\nCompromised Packages:\n")
                for pkg in frontend['compromised_packages']:
                    f.write(f"  - {pkg}\n")
        else:
            f.write("Frontend node_modules not found!\n")
        f.write("\n")
        
        # Backend results
        f.write("BACKEND AUDIT\n")
        f.write("-" * 30 + "\n")
        backend = results['backend']
        if backend['found']:
            f.write(f"Total Packages: {backend['total_packages']}\n")
            f.write(f"Compromised: {backend['compromised_count']}\n")
            f.write(f"Compromised Percentage: {backend['compromised_percent']}%\n")
            f.write(f"Safe Percentage: {backend['safe_percent']}%\n")
            if backend['compromised_packages']:
                f.write("\nCompromised Packages:\n")
                for pkg in backend['compromised_packages']:
                    f.write(f"  - {pkg}\n")
        else:
            f.write("Backend node_modules not found!\n")
        f.write("\n")
        
        # Overall summary
        f.write("OVERALL SUMMARY\n")
        f.write("-" * 30 + "\n")
        overall = results['overall']
        f.write(f"Total Packages: {overall['total_packages']}\n")
        f.write(f"Total Compromised: {overall['total_compromised']}\n")
        f.write(f"Overall Compromised: {overall['compromised_percent']}%\n")
        f.write(f"Overall Safe: {overall['safe_percent']}%\n")
    
    print(f"\nResults saved to: {filename}")
    return filename

if __name__ == "__main__":
    results = check_compromised_packages()
