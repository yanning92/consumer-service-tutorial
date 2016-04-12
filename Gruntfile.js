module.exports = function (grunt) {
    'use strict';
    grunt.event.on('caesiumLaunched', function () {
        require('open')('http://localhost:' + grunt.config.get('caesium').options.port + '/simulator/?project=/connections/car/artifacts/com.ncr/cs/1.0.0/');
    });
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    var tmp = '.tmp/';
    var compressedTmp = tmp + 'compress/';
    var publicCompressTmp = compressedTmp + 'public/';
    var dist = 'dist/';
    var metadataFile = 'service.json';
    var metadata = grunt.file.readJSON(metadataFile);
    var distFile = dist + metadata.identity.groupId + '_' + metadata.identity.artifactId + '_' + metadata.identity.version + '.cs.car';
    var testFiles = [
        'app/bower_components/angular/angular.js',
        'app/bower_components/angular-route/angular-route.js',
        'app/bower_components/angular-mocks/angular-mocks.js',
        'app/bower_components/ccCjsa/ccCjsa.min.js',
        'app/bower_components/ccSdk/ccSdk.min.js',
        'test/unit/**/*.js'
    ];
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            app: [
                'app/{,*/}*.js',
                'Gruntfile.js',
                '!app/bower_components/**'
            ],
            test: {
                options: { jshintrc: true },
                files: {
                    src: [
                        'test/**/*.js',
                        '!test/results/**/*.js'
                    ]
                }
            }
        },
        caesium: {
            options: {
                port: 9090,
                proxyFor: 'http://localhost:8080'
            },
            local: { documentRoot: 'app' }
        },
        wiredep: {
            app: {
                src: ['app/index.html'],
                exclude: ['app/bower_components/ccBoot/']
            }
        },
        compress: {
            minified: {
                options: {
                    archive: distFile,
                    mode: 'zip'
                },
                cwd: compressedTmp,
                src: ['**/*'],
                dest: '/',
                expand: true
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: { dest: publicCompressTmp }
        },
        copy: {
            forMinification: {
                files: [
                    {
                        src: 'service.json',
                        dest: compressedTmp
                    },
                    {
                        cwd: 'app/',
                        src: [
                            '**/*',
                            '!bower_components/**',
                            '!controllers/**',
                            '!services/**',
                            '!directives/**',
                            '!styles/**',
                            '!**/*.js',
                            '!**/*.css'
                        ],
                        dest: publicCompressTmp,
                        expand: true
                    }
                ]
            },
            withoutMinification: {
                files: [
                    {
                        src: 'service.json',
                        dest: compressedTmp
                    },
                    {
                        cwd: 'app/',
                        src: ['**/*'],
                        dest: publicCompressTmp,
                        expand: true
                    }
                ]
            }
        },
        usemin: {
            html: [publicCompressTmp + '{,*/}*.html'],
            css: [publicCompressTmp + 'styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    publicCompressTmp,
                    publicCompressTmp + 'media'
                ]
            }
        },
        clean: [
            tmp,
            'dist/{,*/}*'
        ],
        ngAnnotate: { concattedFiles: { files: { '.tmp/concat/js/cs.js': '.tmp/concat/js/cs.js' } } },
        karma: {
            unitdev: {
                options: {
                    configFile: 'test/karma.conf.js',
                    reporters: [
                        'progress',
                        'coverage'
                    ],
                    files: testFiles.concat([
                        'app/*.js',
                        'app/controllers/**/*.js',
                        'app/services/**/*.js'
                    ])
                }
            },
            unitmin: {
                options: {
                    configFile: 'test/karma.conf.js',
                    files: testFiles.concat([publicCompressTmp + 'js/cs.js'])
                }
            },
            unitnomin: {
                options: {
                    configFile: 'test/karma.conf.js',
                    files: testFiles.concat([
                        publicCompressTmp + '*.js',
                        publicCompressTmp + 'controllers/**/*.js',
                        publicCompressTmp + 'services/**/*.js'
                    ])
                }
            }
        }
    });
    grunt.registerTask('build', [
        'clean',
        'useminPrepare',
        'concat:generated',
        'ngAnnotate:concattedFiles',
        'cssmin:generated',
        'uglify:generated',
        'copy:forMinification',
        'usemin',
        'karma:unitmin',
        'compress:minified'
    ]);
    grunt.registerTask('build:nomin', [
        'clean',
        'copy:withoutMinification',
        'karma:unitnomin',
        'compress'
    ]);
    grunt.registerTask('test', ['karma:unitdev']);
};
